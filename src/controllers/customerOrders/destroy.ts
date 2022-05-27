import { Request, Response, NextFunction } from 'express';
// import { getRepository } from 'typeorm';

// import { CustomerOrder } from 'orm/entities/customerOrders/CustomerOrder';
// import { CustomError } from 'utils/response/custom-error/CustomError';

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  console.log('customerOrders/destroy');
  console.log(req, res, next);
};
