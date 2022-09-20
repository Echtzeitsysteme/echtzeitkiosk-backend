import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CustomerOrder } from 'orm/entities/customerOrders/CustomerOrder';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';
// import { Product } from 'orm/entities/products/Product';

export const list = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const jwtPayload = req.jwtPayload;

  const customerOrderRepository = getRepository(CustomerOrder);

  let customerOrders = null;
  try {
    if (jwtPayload.role === 'SUPERUSER') {
      customerOrders = await customerOrderRepository
        .find({
          select: ['id', 'createdAt', 'total', 'customerInvoice'],
          relations: ['user', 'customerOrderItems', 'customerOrderItems.product'],
          loadEagerRelations: true,
          order: {
            createdAt: 'DESC',
          },
          withDeleted: true,
        })
        .then((customerOrders) => {
          return customerOrders.map((customerOrder) => {
            return delete customerOrder.user.password && customerOrder;
          });
        });
    } else {
      customerOrders = await customerOrderRepository
        .find({
          select: ['id', 'createdAt', 'total', 'customerInvoice'],
          relations: ['user', 'customerOrderItems', 'customerOrderItems.product'],
          loadEagerRelations: true,
          where: {
            user: jwtPayload.id,
          },
          order: {
            createdAt: 'DESC',
          },
        })
        .then((customerOrders) => {
          return customerOrders.map((customerOrder) => {
            return delete customerOrder.user.password && customerOrder;
          });
        });
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `Can't retrieve list of customer orders.`, null, err);
    return next(customError);
  }

  return res.customSuccess(200, 'List of customer orders.', customerOrders);
});
