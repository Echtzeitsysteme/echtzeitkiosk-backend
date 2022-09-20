import { faker } from '@faker-js/faker/locale/de';
import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/users/User';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const destroy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      const customError = new CustomError(404, 'General', 'Not Found', [`User with id:${id} doesn't exists.`]);
      return next(customError);
    }

    user.firstName = 'Deleted';
    user.lastName = 'Deleted';
    // const randomUsername = 'random_' + faker.internet.userName().substring(0, 8) + faker.random.numeric(4) + '_deleted';
    const randomUsername = faker.random.numeric(20) + '_deleted';
    user.username = randomUsername;
    user.email = randomUsername + '@es.tu-darmstadt.de';

    user.password = 'PasswordDeleted123!';
    user.hashPassword();
    await userRepository.save(user);

    await userRepository.softDelete(id);

    res.customSuccess(200, 'User successfully deleted.', { id: user.id, email: user.email });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
});
