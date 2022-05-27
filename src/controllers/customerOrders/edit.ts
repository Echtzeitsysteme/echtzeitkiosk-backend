import { Request, Response, NextFunction } from 'express';
// import { getRepository } from 'typeorm';

// import { CustomerOrder } from 'orm/entities/customerOrders/CustomerOrder';
// import { CustomError } from 'utils/response/custom-error/CustomError';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  console.log('customerOrders/edit');
  console.log(req, res, next);
};
