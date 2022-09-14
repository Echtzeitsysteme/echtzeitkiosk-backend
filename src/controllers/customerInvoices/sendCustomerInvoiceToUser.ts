import { Request, Response, NextFunction } from 'express';
import { getRepository, IsNull } from 'typeorm';

import { CustomerInvoiceStatus, CustomerInvoiceType } from 'consts/CustomerInvoice';
import { CustomerInvoice } from 'orm/entities/customerInvoices/CustomerInvoice';
import { CustomerOrder } from 'orm/entities/customerOrders/CustomerOrder';
import { User } from 'orm/entities/users/User';
import { sendMonthlyInvoiceEmailToCustomer } from 'services/email/email.service';
import { catchAsync } from 'utils/catchAsync';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const sendCustomerInvoiceToUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  const customerOrderRepository = getRepository(CustomerOrder);
  const userRepository = getRepository(User);
  const customerInvoiceRepository = getRepository(CustomerInvoice);

  try {
    const user = await userRepository.findOne(userId);

    if (user && user.role !== 'SUPERUSER') {
      const customerOrders = await customerOrderRepository.find({
        where: {
          user: user,
          customerInvoice: IsNull(),
        },
        relations: ['customerInvoice'],
      });

      if (customerOrders.length !== 0) {
        const newCustomerInvoice = new CustomerInvoice();
        newCustomerInvoice.user = user;
        newCustomerInvoice.customerInvoiceType = CustomerInvoiceType.AD_HOC;
        newCustomerInvoice.customerInvoiceMonthYear = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
        newCustomerInvoice.total = 0;
        newCustomerInvoice.currentUserBalance = user.balance;

        await customerInvoiceRepository.save(newCustomerInvoice);

        for await (const customerOrder of customerOrders) {
          newCustomerInvoice.total = newCustomerInvoice.total + customerOrder.total;
          if (!customerOrder.customerInvoice) {
            customerOrder.customerInvoice = newCustomerInvoice;
            await customerOrderRepository.save(customerOrder);
          }
        }

        const savedPendingInvoice = await customerInvoiceRepository.save(newCustomerInvoice);

        sendMonthlyInvoiceEmailToCustomer(user, savedPendingInvoice);

        // update the customer invoice
        savedPendingInvoice.customerInvoiceStatus = CustomerInvoiceStatus.SENT;
        await customerInvoiceRepository.save(savedPendingInvoice);

        res.customSuccess(200, `Successfully sent customer invoices to the user: ${user.email}`);
      }
    }
  } catch (error) {
    console.log('error', error);
    next(new CustomError(500, 'General', error.message));
  }
});
