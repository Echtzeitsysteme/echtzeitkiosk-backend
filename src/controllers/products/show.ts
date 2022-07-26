import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Product } from 'orm/entities/products/Product';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const show = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const productRepository = getRepository(Product);
  try {
    const product = await productRepository.findOne({ where: { id: req.params.id } });

    if (!product) {
      const customError = new CustomError(404, 'General', 'Not Found', [
        `Product with id:${req.params.id} doesn't exists.`,
      ]);
      return next(customError);
    }

    res.customSuccess(200, 'Product successfully listed.', product);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
});
