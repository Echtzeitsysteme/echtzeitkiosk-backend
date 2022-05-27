import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Product } from 'orm/entities/products/Product';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  const productRepository = getRepository(Product);
  try {
    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
      const customError = new CustomError(404, 'General', ' Not Found', [`Product with id:${id} doesn't exists.`]);
      return next(customError);
    }
    productRepository.delete(id);

    res.customSuccess(200, 'Product successfully deleted.', { id: product.id, productTitle: product.productTitle });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
