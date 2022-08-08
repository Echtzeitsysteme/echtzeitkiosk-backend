import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import moment from 'moment';
import { getRepository } from 'typeorm';

import { TokenType } from 'consts/TokenType';
import { Token } from 'orm/entities/tokens/Token';
import { User } from 'orm/entities/users/User';
import { sendPasswordChangedEmail } from 'services/email';
import { getUserById } from 'services/users';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const tokenFromRequest: string = req.query.token as string;
  const newPassword: string = req.body.password as string;

  if (!tokenFromRequest || !newPassword) {
    throw new CustomError(httpStatus.BAD_REQUEST, 'General', 'Missing token or new password');
  }

  const tokenRepository = getRepository(Token);

  const verifiedEmailTokenRecord = await Token.verifyToken(tokenFromRequest, TokenType.RESET_PASSWORD);

  if (!verifiedEmailTokenRecord) {
    throw new CustomError(httpStatus.UNAUTHORIZED, 'General', 'Invalid token');
  }

  const userRepository = getRepository(User);

  if (verifiedEmailTokenRecord.isBlacklisted) {
    throw new CustomError(httpStatus.UNAUTHORIZED, 'General', 'Token is blacklisted');
  }

  if (moment(verifiedEmailTokenRecord.expiresAt).isBefore(moment())) {
    throw new CustomError(httpStatus.UNAUTHORIZED, 'General', 'Token expired');
  }

  const user = await getUserById(verifiedEmailTokenRecord.userId);

  if (!user) {
    throw new CustomError(httpStatus.NOT_FOUND, 'General', 'User not found');
  }

  // compare old password with new password to check if it's the same
  const isSame = await bcrypt.compare(newPassword, user.password);

  if (isSame) {
    throw new CustomError(httpStatus.BAD_REQUEST, 'General', 'New password is the same as old password');
  }

  user.password = newPassword;
  user.hashPassword();
  await userRepository.save(user);

  // delete token
  await tokenRepository.remove(verifiedEmailTokenRecord);

  sendPasswordChangedEmail(user);

  return res.customSuccess(200, 'Password reset. You can now login with your new password', null);
});
