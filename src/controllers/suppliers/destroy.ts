import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Supplier } from 'orm/entities/suppliers/Supplier';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  const supplierRepository = getRepository(Supplier);
  try {
    const supplier = await supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      const customError = new CustomError(404, 'General', 'Not Found', [`Supplier with id:${id} doesn't exists.`]);
      return next(customError);
    }
    supplierRepository.delete(id);

    res.customSuccess(200, 'Supplier successfully deleted.', { id: supplier.id, name: supplier.name });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
