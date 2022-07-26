import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import { Entity, Column, JoinColumn, ManyToOne, getRepository } from 'typeorm';

import { config } from 'config/config';
import { TokenType } from 'consts/TokenType';
import { getUserByEmail } from 'services/users';
import { AbstractEntity } from 'utils/AbstractEntity';
import { CustomError } from 'utils/response/custom-error/CustomError';

import { User } from '../users/User';

@Entity('tokens')
export class Token extends AbstractEntity {
  @Column({ type: 'enum', enum: TokenType })
  type: TokenType;

  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User = new User();

  @Column({ name: 'user_id' })
  userId: string;

  // blacklisted
  @Column({ name: 'is_blacklisted', default: false })
  isBlacklisted: boolean;

  // expires
  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  // generated token
  @Column({ name: 'value', unique: true })
  value: string;

  static generateToken = (userId: string, expires: Moment, type: TokenType, secret: string = config.jwt.secret) => {
    const payload = {
      sub: userId,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    };

    return jwt.sign(payload, secret);
  };

  static saveToken = async (tokenValue: string, user: User, expires: Moment, type: TokenType, blacklisted = false) => {
    const tokenRepository = getRepository(Token);

    const tokenRecord = new Token();

    tokenRecord.value = tokenValue;
    tokenRecord.user = user;
    tokenRecord.userId = user.id;
    tokenRecord.expiresAt = expires.toDate();
    tokenRecord.type = type;
    tokenRecord.isBlacklisted = blacklisted;

    await tokenRepository.save(tokenRecord);
  };

  static verifyToken = async (tokenValue: string, type: TokenType, secret: string = config.jwt.secret) => {
    let payload;
    try {
      payload = jwt.verify(tokenValue, secret);
      console.log(payload);
    } catch (error) {
      throw new CustomError(httpStatus.UNAUTHORIZED, 'General', 'Token could not be verified');
    }

    if (!payload) {
      throw new CustomError(httpStatus.UNAUTHORIZED, 'General', 'Invalid token');
    }

    const tokenRepository = getRepository(Token);

    let tokenRecord;
    try {
      tokenRecord = await tokenRepository.findOne({
        where: {
          value: tokenValue,
          type,
          isBlacklisted: false,
          userId: payload.sub,
        },
      });
    } catch (error) {
      throw new CustomError(httpStatus.UNAUTHORIZED, 'General', 'Invalid token');
    }

    if (!tokenRecord) {
      throw new CustomError(httpStatus.NOT_FOUND, 'General', 'Token not found');
    }

    if (moment(tokenRecord.expiresAt).isBefore(moment())) {
      throw new CustomError(httpStatus.UNAUTHORIZED, 'General', 'Token expired');
    }

    return tokenRecord;
  };

  static generateResetPasswordToken = async (email) => {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new CustomError(httpStatus.NOT_FOUND, 'General', 'No users found with this email');
    }
    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = Token.generateToken(user.id, expires, TokenType.RESET_PASSWORD);
    await Token.saveToken(resetPasswordToken, user, expires, TokenType.RESET_PASSWORD);
    return resetPasswordToken;
  };

  static generateVerifyEmailToken = async (user) => {
    const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
    const verifyEmailToken = Token.generateToken(user.id, expires, TokenType.VERIFY_EMAIL);
    await Token.saveToken(verifyEmailToken, user, expires, TokenType.VERIFY_EMAIL);
    return verifyEmailToken;
  };
}
