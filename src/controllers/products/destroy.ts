import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Product } from 'orm/entities/products/Product';
// import { SystemState } from 'orm/entities/systemState/SystemState';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const destroy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  const productRepository = getRepository(Product);
  try {
    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
      const customError = new CustomError(404, 'General', ' Not Found', [`Product with id:${id} doesn't exists.`]);
      return next(customError);
    }

    // const productQuantity = product.quantity;
    // const productPrice = product.resalePricePerUnit;

    productRepository.delete(id);

    res.customSuccess(200, 'Product successfully deleted.', { id: product.id, productTitle: product.productTitle });

    // const systemStateRepository = getRepository(SystemState);
    // const systemState = await systemStateRepository.findOne();
    // if (systemState) {
    //   if (productQuantity > 0) {
    //     systemState.balance += productQuantity * productPrice;
    //     await systemStateRepository.save(systemState);
    //   }
    // }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
});
