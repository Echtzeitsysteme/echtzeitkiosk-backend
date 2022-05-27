import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Product } from 'orm/entities/products/Product';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  const productRepository = getRepository(Product);
  try {
    const products = await productRepository.find();

    res.customSuccess(200, 'Products successfully listed.', products);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
