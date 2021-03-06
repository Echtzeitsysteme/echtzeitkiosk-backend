import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/users/User';
import { sendRegistrationDeclinationEmailToUser } from 'services/email';
import { deleteUser } from 'services/users';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const declineRegistration = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const userRepository = getRepository(User);

  try {
    const user = await userRepository.findOne(id);

    if (!user) {
      const customError = new CustomError(404, 'Raw', `User with id ${id} not found.`, null);
      return next(customError);
    }

    if (user.role === 'SUPERUSER') {
      const customError = new CustomError(400, 'Raw', `User with id ${id} is a superuser.`, null);
      return next(customError);
    }

    if (user.isApproved) {
      const customError = new CustomError(400, 'Raw', `User with id ${id} is already approved.`, null);
      return next(customError);
    }

    sendRegistrationDeclinationEmailToUser(user);

    await deleteUser(user);

    res.customSuccess(200, 'User successfully declined and then deleted.', user);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `Can't decline user.`, null, err);
    return next(customError);
  }
});
