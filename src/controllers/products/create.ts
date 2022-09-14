import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Product } from 'orm/entities/products/Product';
import { SystemState } from 'orm/entities/systemState/SystemState';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface NewProduct {
  productTitle: string;
  resalePricePerUnit: number;
  quantity: number;
  productPhotoUrl?: string;
}

export const create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const productRepository = getRepository(Product);
  try {
    const newProduct: NewProduct = req.body;

    const product = await productRepository.save(newProduct);

    res.customSuccess(200, 'Product successfully saved.', product);

    // now we need to update the system state to reflect the new product. We do this by subtracting the product's price * quantity from the system state's balance
    // Use these two variables: resalePricePerUnit and quantity
    const systemStateRepository = getRepository(SystemState);
    const systemState = await systemStateRepository.findOne();
    if (systemState) {
      systemState.balance -= product.resalePricePerUnit * product.quantity;
      await systemStateRepository.save(systemState);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
});
