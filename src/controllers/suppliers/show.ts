import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Supplier } from 'orm/entities/suppliers/Supplier';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const show = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  const supplierRepository = getRepository(Supplier);
  try {
    const supplier = await supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      const customError = new CustomError(404, 'General', `Supplier with id:${id} not found.`, ['User not found.']);
      return next(customError);
    }
    res.customSuccess(200, 'Supplier found', supplier);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
