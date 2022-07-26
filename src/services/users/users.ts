import httpStatus from 'http-status';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/users/User';
import { sendAccountDeletedEmail } from 'services/email';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const deleteUser = async (user: User): Promise<void> => {
  const userRepository = getRepository(User);

  try {
    await userRepository.remove(user);

    sendAccountDeletedEmail(user);
    console.log(`User with id ${user.id} successfully deleted.`);
  } catch (err) {
    console.log(err);
  }
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const userRepository = getRepository(User);

  try {
    return await userRepository.findOne({ where: { email } });
  } catch (err) {
    console.log(err);
  }
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const userRepository = getRepository(User);

  try {
    return await userRepository.findOne({ where: { id } });
  } catch (err) {
    console.log(err);
  }
};

export const updateUserById = async (id: string, updateBody: Partial<User>): Promise<User | undefined> => {
  const userRepository = getRepository(User);

  const user = await getUserById(id);

  if (!user) throw new CustomError(httpStatus.NOT_FOUND, 'General', 'User not found');

  try {
    return await userRepository.save({ ...user, ...updateBody });
  } catch (err) {
    console.log(err);
  }
};
