import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/users/User';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const list = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userRepository = getRepository(User);
  try {
    // populate user.customerOrders
    const users = await userRepository.find({
      select: [
        'id',
        'username',
        'email',
        'role',
        'language',
        'createdAt',
        'updatedAt',
        'isApproved',
        'isEmailVerified',
        'isFirstTimeLogin',
        'activeTill',
        'balance',
        'firstName',
        'lastName',
      ],
      relations: ['customerOrders'],
    });

    res.customSuccess(200, 'List of users.', users);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `Can't retrieve list of users.`, null, err);
    return next(customError);
  }
});
