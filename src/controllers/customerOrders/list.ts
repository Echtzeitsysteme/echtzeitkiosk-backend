import { Request, Response, NextFunction } from 'express';
// import { getRepository } from 'typeorm';

// import { CustomerOrder } from 'orm/entities/customerOrders/CustomerOrder';
// import { CustomError } from 'utils/response/custom-error/CustomError';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  console.log('customerOrders/list');
  console.log(req, res, next);
};
