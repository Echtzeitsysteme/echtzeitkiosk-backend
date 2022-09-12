import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { SystemState } from 'orm/entities/systemState/SystemState';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const editBalance = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const systemStateRepository = getRepository(SystemState);
  try {
    const systemState = await systemStateRepository.findOne();
    if (!systemState) {
      const customError = new CustomError(404, 'Raw', 'System state not found.', null, null);
      return next(customError);
    }

    systemState.balance = req.body.balance;

    await systemStateRepository.save(systemState);

    res.customSuccess(200, 'Balance successfully edited.', systemState);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
});
