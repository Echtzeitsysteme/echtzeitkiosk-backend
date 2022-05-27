import { getRepository } from 'typeorm';

import { config } from 'config/config';
import { RoleType } from 'consts/RoleType';
import { SystemState } from 'orm/entities/systemState/SystemState';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const createSuperuserIfnotExists = async (): Promise<void> => {
  const userRepository = getRepository(User);
  const superuser = await userRepository.findOne({ where: { role: 'SUPERUSER' } });

  if (!superuser) {
    const superuser = new User();
    superuser.role = RoleType.SUPERUSER;
    superuser.username = 'superuser';
    superuser.email = config.superuser.email;
    superuser.password = config.superuser.password;
    superuser.language = 'en-US';
    superuser.isEmailVerified = true;
    superuser.isApproved = true;

    // superuser.firstName = 'Superuser';
    // superuser.lastName = 'Superuser';

    superuser.hashPassword();
    await userRepository.save(superuser);
    console.log('Default superuser created');
    return;
  }

  console.log('Default superuser already exists, no need to create');
  return;
};

export const createSystemStateTableIfNotExists = async (): Promise<void> => {
  const systemStateRepository = getRepository(SystemState);

  // get the oldest system state, if it exists. check creation date
  const systemState = await systemStateRepository
    .createQueryBuilder('systemState')
    .orderBy('systemState.createdAt', 'ASC')
    .getOne();

  if (!systemState) {
    const systemState = new SystemState();
    await systemStateRepository.save(systemState);
    console.log('System state table created, DO NOT DELETE IT MANUALLY');
    return;
  }

  console.log('System state table already exists, no need to create');
  return;
};

export const getSuperuser = async (): Promise<User> => {
  const userRepository = getRepository(User);

  try {
    const user = await userRepository.findOne({ where: { role: 'SUPERUSER' } });

    if (!user) {
      const customError = new CustomError(404, 'Raw', `Superuser not found.`, null);
      throw customError;
    }

    return user;
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `Can't retrieve superuser.`, null, err);
    throw customError;
  }
};
