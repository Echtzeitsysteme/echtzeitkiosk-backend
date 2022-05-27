import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Product } from 'orm/entities/products/Product';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const productRepository = getRepository(Product);
  try {
    const product = await productRepository.save(req.body);

    res.customSuccess(200, 'Product successfully saved.', product);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
