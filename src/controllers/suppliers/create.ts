import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Supplier } from 'orm/entities/suppliers/Supplier';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const supplierRepository = getRepository(Supplier);
  try {
    const supplier = await supplierRepository.save(req.body);

    res.customSuccess(200, 'Supplier successfully saved.', supplier);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
