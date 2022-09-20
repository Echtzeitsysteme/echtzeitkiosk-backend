import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CustomerInvoice } from 'orm/entities/customerInvoices/CustomerInvoice';
// import { User } from 'orm/entities/users/User';
// import customerInvoiceService from 'services/customerInvoices';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const list = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const jwtPayload = req.jwtPayload;

  const customerInvoiceRepository = getRepository(CustomerInvoice);

  let customerInvoices = null;
  try {
    if (jwtPayload.role === 'SUPERUSER') {
      customerInvoices = await customerInvoiceRepository
        .find({
          select: ['id', 'createdAt', 'total', 'customerInvoiceMonthYear', 'currentUserBalance', 'customerInvoiceType'],
          relations: ['user'],
          loadEagerRelations: true,
          order: {
            createdAt: 'DESC',
          },
          withDeleted: true,
        })
        .then((customerInvoices) => {
          return customerInvoices.map((customerInvoice) => {
            return delete customerInvoice.user.password && customerInvoice;
          });
        });
    } else {
      customerInvoices = await customerInvoiceRepository
        .find({
          select: ['id', 'createdAt', 'total', 'customerInvoiceMonthYear', 'currentUserBalance', 'customerInvoiceType'],
          relations: ['user'],
          loadEagerRelations: true,
          where: {
            user: jwtPayload.id,
          },
          order: {
            createdAt: 'DESC',
          },
        })
        .then((customerInvoices) => {
          return customerInvoices.map((customerInvoice) => {
            return delete customerInvoice.user.password && customerInvoice;
          });
        });
    }

    return res.customSuccess(200, 'List of customer invoices.', customerInvoices);
  } catch (err) {
    console.log(err);
    const customError = new CustomError(400, 'Raw', `Can't retrieve list of customer invoices.`, null, err);
    return next(customError);
  }
});
