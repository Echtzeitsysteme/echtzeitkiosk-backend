import { Request, Response, NextFunction } from 'express';
import moment from 'moment';
import { getRepository } from 'typeorm';

// import { RoleType } from 'consts/RoleType';
import { config } from 'config/config';
import { User } from 'orm/entities/users/User';
import { JwtPayload } from 'types/JwtPayload';
import { catchAsync } from 'utils/catchAsync';
import { createJwtToken } from 'utils/createJwtToken';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      const customError = new CustomError(404, 'General', 'Not Found', ['Incorrect email or password']);
      return next(customError);
    }

    if (!user.checkIfPasswordMatch(password)) {
      const customError = new CustomError(404, 'General', 'Not Found', ['Incorrect email or password']);
      return next(customError);
    }

    if (!user.isApproved) {
      const customError = new CustomError(404, 'General', 'Not Found', [
        'Your account is not approved yet! Please wait for admin approval.',
      ]);
      return next(customError);
    }

    const jwtPayload: JwtPayload = {
      id: user.id,
      role: user.role,
      iat: moment().unix(),
      exp: moment().add(config.jwt.accessExpirationMinutes, 'minutes').unix(),
    };

    try {
      const token = createJwtToken(jwtPayload);
      res.customSuccess(200, 'Token successfully created.', `Bearer ${token}`);
    } catch (err) {
      const customError = new CustomError(400, 'Raw', "Token can't be created", null, err);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
});
