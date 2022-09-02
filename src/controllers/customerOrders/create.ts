import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CustomerOrderItem } from 'orm/entities/customerOrderItems/CustomerOrderItem';
import { CustomerOrder } from 'orm/entities/customerOrders/CustomerOrder';
import { Product } from 'orm/entities/products/Product';
import { User } from 'orm/entities/users/User';
import { sendEmailNotfForOrder } from 'services/email/email.service';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerOrderItems = req.body.customerOrderItems;
    const { id } = req.jwtPayload;

    const customerOrderRepository = getRepository(CustomerOrder);
    const customerOrderItemRepository = getRepository(CustomerOrderItem);
    const productRepository = getRepository(Product);
    const userRepository = getRepository(User);

    const user = await userRepository.findOne(id);

    if (!user) {
      const customError = new CustomError(404, 'General', `User with id:${id} not found.`);
      return next(customError);
    }

    if (!customerOrderItems || customerOrderItems.length === 0) {
      const customError = new CustomError(400, 'General', 'Customer order items are required.');
      return next(customError);
    }

    const customerOrder = new CustomerOrder();
    customerOrder.user = user;

    await customerOrderRepository.save(customerOrder);

    for await (const customerOrderItem of customerOrderItems) {
      const customerOrderItemEntity = new CustomerOrderItem();
      const product = await productRepository.findOne({
        where: { id: customerOrderItem.productId },
      });

      if (!product) {
        const customError = new CustomError(400, 'General', 'Product not found');
        return next(customError);
      }

      if (customerOrderItem.quantity > product.quantity) {
        const customError = new CustomError(400, 'General', 'Not enough quantity');
        return next(customError);
      }

      if (customerOrderItem.quantity < 1) {
        const customError = new CustomError(400, 'General', 'Quantity must be greater than 0');
        return next(customError);
      }

      customerOrderItemEntity.product = product;
      customerOrderItemEntity.quantity = customerOrderItem.quantity;
      customerOrderItemEntity.subtotal = product.resalePricePerUnit * customerOrderItem.quantity;
      customerOrderItemEntity.pricePerUnit = product.resalePricePerUnit;

      customerOrder.total += customerOrderItemEntity.subtotal;
      customerOrderItemEntity.customerOrder = customerOrder;
      await customerOrderRepository.save(customerOrder);

      await customerOrderItemRepository.save(customerOrderItemEntity);

      await productRepository.update(customerOrderItem.productId, {
        quantity: product.quantity - customerOrderItem.quantity,
      });
    }

    customerOrder.total = Math.round(customerOrder.total * 100) / 100;
    await customerOrderRepository.save(customerOrder);
    user.balance -= customerOrder.total;
    user.balance = Math.round(user.balance * 100) / 100;

    user.totalSpent += customerOrder.total;
    user.totalSpent = Math.round(user.totalSpent * 100) / 100;

    await userRepository.save(user);

    delete customerOrder.user;
    delete customerOrder.customerInvoice;

    if (user.isEmailNotfForOrderEnabled) sendEmailNotfForOrder(user, customerOrder);

    res.customSuccess(200, 'Customer order successfully saved.', { ...customerOrder, balanceAfterOrder: user.balance });
  } catch (err) {
    console.error(err);
    next(new CustomError(400, 'Raw', 'Error creating customer order', null, err));
  }
});
