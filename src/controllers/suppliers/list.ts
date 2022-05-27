import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Supplier } from 'orm/entities/suppliers/Supplier';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  const supplierRepository = getRepository(Supplier);
  try {
    const suppliers = await supplierRepository.find();

    res.customSuccess(200, 'List of suppliers.', suppliers);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `Can't retrieve list of suppliers.`, null, err);
    return next(customError);
  }
};
