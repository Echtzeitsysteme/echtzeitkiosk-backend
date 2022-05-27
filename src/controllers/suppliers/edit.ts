import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Supplier } from 'orm/entities/suppliers/Supplier';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const supplierRepository = getRepository(Supplier);
  try {
    const supplier = await supplierRepository.findOne({ where: { id: req.params.id } });

    if (!supplier) {
      const customError = new CustomError(404, 'General', 'Not Found', [
        `Supplier with id:${req.params.id} doesn't exists.`,
      ]);
      return next(customError);
    }

    const updatedSupplier = await supplierRepository.save({
      ...supplier,
      ...req.body,
    });

    res.customSuccess(200, 'Supplier successfully updated.', updatedSupplier);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
