import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { RoleType } from 'consts/RoleType';
import { SystemState } from 'orm/entities/systemState/SystemState';
import { User } from 'orm/entities/users/User';
import // sendVerificationEmail,
// sendRegistrationRequestReceivedEmailToUser,
// sendUserRegisteredEmailToSuperuser,
'services/email';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, role, username, firstName, lastName, activeTill, language, invitationCode } = req.body;

  const userRepository = getRepository(User);
  const systemStateRepository = getRepository(SystemState);
  try {
    const user = await userRepository.findOne({ where: { email } });

    if (user) {
      const customError = new CustomError(400, 'General', 'User already exists', [
        `Email '${user.email}' already exists`,
      ]);
      return next(customError);
    }

    const systemState = await systemStateRepository
      .createQueryBuilder('systemState')
      .orderBy('systemState.createdAt', 'ASC')
      .getOne();

    if (!systemState.invitationCode || systemState.invitationCode !== invitationCode) {
      const customError = new CustomError(400, 'General', 'Invitation code is not valid', [
        `Invitation code is not valid`,
      ]);
      return next(customError);
    }

    try {
      const newUser = new User();
      newUser.email = email;
      newUser.password = password;
      newUser.role = role;
      newUser.username = username;
      newUser.firstName = firstName;
      newUser.lastName = lastName;
      if (role === RoleType.GUEST) newUser.activeTill = activeTill;
      newUser.language = language;

      newUser.hashPassword();
      await userRepository.save(newUser);

      // delete password from the newUser object before sending it to the client
      delete newUser.password;

      // sendVerificationEmail(newUser);
      // sendRegistrationRequestReceivedEmailToUser(newUser);
      // sendUserRegisteredEmailToSuperuser(newUser);

      return res.customSuccess(200, 'User successfully created.', newUser);
    } catch (err) {
      const customError = new CustomError(400, 'Raw', `User with the email '${email}' can't be created`, null, err);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
