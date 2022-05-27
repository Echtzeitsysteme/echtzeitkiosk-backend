// import { Request, Response, NextFunction } from 'express';
// import validator from 'validator';
// import { getRepository } from 'typeorm';

// import { Product } from 'orm/entities/products/Product';
// import { CustomError } from 'utils/response/custom-error/CustomError';
// import { ErrorValidation } from 'utils/response/custom-error/types';

// export const validatorCreate = async (req: Request, res: Response, next: NextFunction) => {
//   let { username, name } = req.body;
//   const errorsValidation: ErrorValidation[] = [];
//   const userRepository = getRepository(Product);

//   if (errorsValidation.length !== 0) {
//     const customError = new CustomError(400, 'Validation', 'Edit user validation error', null, null, errorsValidation);
//     return next(customError);
//   }
//   return next();
// };
