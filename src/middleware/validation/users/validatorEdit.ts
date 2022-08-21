import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const validatorEdit = async (req: Request, res: Response, next: NextFunction) => {
  let { username, name } = req.body;

  const errorsValidation: ErrorValidation[] = [];
  const userRepository = getRepository(User);

  username = !username ? '' : username;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  name = !name ? '' : name;

  const user = await userRepository.findOne({ username });
  if (user) {
    errorsValidation.push({ username: `Username '${username}' already exists` });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Edit user validation error', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
