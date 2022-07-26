import { Request, Response } from 'express';
import httpStatus from 'http-status';
import moment from 'moment';
import { getRepository } from 'typeorm';

import { TokenType } from 'consts/TokenType';
import { Token } from 'orm/entities/tokens/Token';
import { updateUserById } from 'services/users';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const tokenFromRequest: string = req.query.token as string;

  const tokenRepository = getRepository(Token);

  const verifiedEmailTokenRecord = await Token.verifyToken(tokenFromRequest, TokenType.VERIFY_EMAIL);

  if (!verifiedEmailTokenRecord) {
    throw new CustomError(httpStatus.UNAUTHORIZED, 'General', 'Invalid token');
  }

  // const userRepository = getRepository(User);

  if (verifiedEmailTokenRecord.isBlacklisted) {
    throw new CustomError(httpStatus.UNAUTHORIZED, 'General', 'Token is blacklisted');
  }

  if (moment(verifiedEmailTokenRecord.expiresAt).isBefore(moment())) {
    throw new CustomError(httpStatus.UNAUTHORIZED, 'General', 'Token expired');
  }

  if (verifiedEmailTokenRecord.user.isEmailVerified) {
    throw new CustomError(httpStatus.UNAUTHORIZED, 'General', 'User already verified');
  }

  const user = await updateUserById(verifiedEmailTokenRecord.userId, { isEmailVerified: true });

  if (!user) throw new CustomError(httpStatus.NOT_FOUND, 'General', 'User not found');

  // delete token
  await tokenRepository.remove(verifiedEmailTokenRecord);

  return res.customSuccess(200, 'Email verified', null);
});
