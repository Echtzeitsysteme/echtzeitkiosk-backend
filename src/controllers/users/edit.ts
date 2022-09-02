import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/users/User';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const edit = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const { username, balance, isEmailNotfForOrderEnabled } = req.body;

  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      const customError = new CustomError(404, 'General', `User with id:${id} not found.`, ['User not found.']);
      return next(customError);
    }

    if (isEmailNotfForOrderEnabled)
      user.isEmailNotfForOrderEnabled = isEmailNotfForOrderEnabled === 'true' ? true : false;

    if (username) user.username = username;
    if (balance) user.balance = balance;

    console.log(user);

    try {
      await userRepository.save(user);
      res.customSuccess(200, 'User successfully saved.');
    } catch (err) {
      const customError = new CustomError(409, 'Raw', `User '${user.email}' can't be saved.`, null, err);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
});
