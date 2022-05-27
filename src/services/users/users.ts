import { getRepository } from 'typeorm';

import { User } from 'orm/entities/users/User';
import { sendAccountDeletedEmail } from 'services/email';

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
