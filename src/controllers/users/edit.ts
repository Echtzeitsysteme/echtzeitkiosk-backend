import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { SystemState } from 'orm/entities/systemState/SystemState';
import { User } from 'orm/entities/users/User';
import { catchAsync } from 'utils/catchAsync';
import { financial } from 'utils/financial';
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

    const prevBalance = financial(user.balance);
    const newBalance = financial(balance);
    if (balance) {
      user.balance = financial(newBalance);
    }

    try {
      await userRepository.save(user);
      res.customSuccess(200, 'User successfully saved.');

      if (balance) {
        const systemStateRepository = getRepository(SystemState);
        const systemState = await systemStateRepository.findOne();

        if (systemState) {
          if (prevBalance > newBalance) {
            systemState.balance = financial(systemState.balance) - financial(prevBalance - newBalance);
          } else {
            systemState.balance = financial(systemState.balance) + financial(newBalance - prevBalance);
          }

          await systemStateRepository.save(systemState);
        }
      }
    } catch (err) {
      const customError = new CustomError(409, 'Raw', `User '${user.email}' can't be saved.`, null, err);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
});
