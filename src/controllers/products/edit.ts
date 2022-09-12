import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Product } from 'orm/entities/products/Product';
import { SystemState } from 'orm/entities/systemState/SystemState';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const edit = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const productRepository = getRepository(Product);
  try {
    const product = await productRepository.findOne({ where: { id: req.params.id } });

    if (!product) {
      const customError = new CustomError(404, 'General', 'Not Found', [
        `Product with id:${req.params.id} doesn't exists.`,
      ]);
      return next(customError);
    }

    const { quantity: prevQuantity, resalePricePerUnit: prevResalePricePerUnit } = product;
    const { quantity: newQuantity, resalePricePerUnit: newResalePricePerUnit } = req.body;

    const updatedProduct = await productRepository.save({
      ...product,
      ...req.body,
    });

    res.customSuccess(200, 'Product successfully updated.', updatedProduct);

    // now we need to update the system state to reflect the new product. We do this by subtracting or adding the product's price * quantity from the system state's balance
    // Use these two variables: resalePricePerUnit and quantity
    const systemStateRepository = getRepository(SystemState);
    const systemState = await systemStateRepository.findOne();
    if (systemState) {
      if (prevQuantity !== newQuantity || prevResalePricePerUnit !== newResalePricePerUnit) {
        if (prevQuantity < newQuantity) {
          systemState.balance -= (newQuantity - prevQuantity) * newResalePricePerUnit;
        } else {
          systemState.balance += (prevQuantity - newQuantity) * newResalePricePerUnit;
        }

        await systemStateRepository.save(systemState);
      }
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
});
