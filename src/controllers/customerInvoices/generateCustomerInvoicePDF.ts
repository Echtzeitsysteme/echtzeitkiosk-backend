import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CustomerInvoiceType } from 'consts/CustomerInvoice';
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
      withDeleted: true,
    });

    if (!customerInvoice)
      return next(new CustomError(404, 'General', `Customer invoice with id ${req.params.id} not found.`));

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: customerInvoice.user.id }, withDeleted: true });

    if (!user) return next(new CustomError(404, 'General', `User with id ${customerInvoice.user} not found.`));

    const customerInvoiceMonthYear = customerInvoice.customerInvoiceMonthYear;
    const customerInvoiceType = customerInvoice.customerInvoiceType;
    let customerInvoiceCreatedAtLocale = customerInvoice.createdAt.toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
    });

    customerInvoiceCreatedAtLocale = customerInvoiceCreatedAtLocale.replaceAll('.', '_');
    customerInvoiceCreatedAtLocale = customerInvoiceCreatedAtLocale.replaceAll(',', '_');
    customerInvoiceCreatedAtLocale = customerInvoiceCreatedAtLocale.replaceAll(' ', '_');

    let attachmentFilename = '';
    if (customerInvoiceType === CustomerInvoiceType.MONTHLY) {
      attachmentFilename = `Echtzeitkiosk_Monthly_Invoice_${customerInvoiceMonthYear}.pdf`;
    }
    if (customerInvoiceType === CustomerInvoiceType.AD_HOC) {
      attachmentFilename = `Echtzeitkiosk_Ad_Hoc_Invoice_${customerInvoiceCreatedAtLocale}.pdf`;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=' + attachmentFilename);

    await customerInvoiceService.generateCustomerInvoicePDFandPipeToResponse(res, user, customerInvoice);
  } catch (error) {
    console.log(error);
    next(new CustomError(500, 'General', error.message));
  }
});
