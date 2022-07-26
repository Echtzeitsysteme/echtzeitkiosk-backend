import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CustomerInvoice } from 'orm/entities/customerInvoices/CustomerInvoice';
import { User } from 'orm/entities/users/User';
import customerInvoiceService from 'services/customerInvoices';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const generateCustomerInvoicePDF = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const customerInvoiceRepository = getRepository(CustomerInvoice);

  try {
    const customerInvoice = await customerInvoiceRepository.findOne({
      where: { id: req.params.id },
      relations: ['user'],
    });

    if (!customerInvoice)
      return next(new CustomError(404, 'General', `Customer invoice with id ${req.params.id} not found.`));

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: customerInvoice.user.id } });

    if (!user) return next(new CustomError(404, 'General', `User with id ${customerInvoice.user} not found.`));

    const customerInvoiceMonthYear = customerInvoice.customerInvoiceMonthYear;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Echtzeitkiosk_Monthly_Invoice_${customerInvoiceMonthYear}.pdf`,
    );

    await customerInvoiceService.generateCustomerInvoicePDFandPipeToResponse(res, user, customerInvoice);
  } catch (error) {
    next(new CustomError(500, 'General', error.message));
  }
});
