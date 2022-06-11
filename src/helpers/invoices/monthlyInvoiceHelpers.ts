import { getRepository } from 'typeorm';

import { CustomerInvoiceType, CustomerInvoiceStatus } from 'consts/CustomerInvoice';
import { CustomerInvoice } from 'orm/entities/customerInvoices/CustomerInvoice';
import { CustomerOrder } from 'orm/entities/customerOrders/CustomerOrder';
import { User } from 'orm/entities/users/User';

import { sendMonthlyInvoiceEmailToCustomer } from '../../services/email/email.service';

// iterate over all users. For each user, check if the user has a customer invoice for the current month. If not, create a new customer invoice for the user. If the user has a customer invoice for the current month, then skip it. And then iterate over all customer orders for the user and then update the customer invoice balance and content.
export const generateMonthlyInvoices = async () => {
  const customerOrderRepository = getRepository(CustomerOrder);
  const userRepository = getRepository(User);
  const customerInvoiceRepository = getRepository(CustomerInvoice);

  const users = await userRepository.find();

  for await (const user of users) {
    const customerInvoice = await customerInvoiceRepository.findOne({
      where: {
        user: user,
        customerInvoiceType: CustomerInvoiceType.MONTHLY,
        // customerInvoiceMonthYear: `${new Date().getMonth() + 1}-${new Date().getFullYear()}`,
      },
    });

    if (!customerInvoice) {
      if (user.role === 'SUPERUSER') continue; // handle this case in the findOne query above

      const newCustomerInvoice = new CustomerInvoice();
      newCustomerInvoice.user = user;
      newCustomerInvoice.customerInvoiceType = CustomerInvoiceType.MONTHLY;
      newCustomerInvoice.customerInvoiceMonthYear = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
      newCustomerInvoice.total = 0;
      newCustomerInvoice.currentUserBalance = user.balance;

      const customerOrders = await customerOrderRepository.find({
        where: {
          user: user,
        },
      });

      for await (const customerOrder of customerOrders) {
        newCustomerInvoice.total = newCustomerInvoice.total + customerOrder.total;
        if (!customerOrder.customerInvoice) customerOrder.customerInvoice = newCustomerInvoice;
      }

      await customerInvoiceRepository.save(newCustomerInvoice);
    }
  }
};

/**
 * Inform all customers about the new monthly invoice
 * Send a link to the customer to generate and download the invoice
 */
export const sendMonthlyInvoicesToCustomers = async () => {
  const customerInvoiceRepository = getRepository(CustomerInvoice);
  const userRepository = getRepository(User);

  const customerInvoices = await customerInvoiceRepository.find({
    where: {
      customerInvoiceType: CustomerInvoiceType.MONTHLY,
      // customerInvoiceMonthYear: `${new Date().getMonth() + 1}-${new Date().getFullYear()}`,
    },
  });

  // console.log('customerInvoices', customerInvoices);

  for await (const customerInvoice of customerInvoices) {
    const user = await userRepository.findOne(customerInvoice.user);
    if (user.role === 'SUPERUSER') continue; // handle this case in the findOne query above

    if (customerInvoice.customerInvoiceStatus === CustomerInvoiceStatus.PENDING) {
      console.log(`Sending monthly invoice to ${user.email}`);
      sendMonthlyInvoiceEmailToCustomer(user, customerInvoice);

      // update the customer invoice
      customerInvoice.customerInvoiceStatus = CustomerInvoiceStatus.SENT;
      await customerInvoiceRepository.save(customerInvoice);
    }
  }
};

// Number ||Order Date || Order Item || Price || Quantity || Subtotal
// 1 ||12/01/2019 || Item 1 || $10.00 || 1 || $10.00
// 2 ||12/01/2019 || Item 2 || $20.00 || 2 || $40.00
// 3 ||12/01/2019 || Item 3 || $30.00 || 3 || $90.00
// 4 ||12/01/2019 || Item 4 || $40.00 || 4 || $160.00
// 5 ||12/01/2019 || Item 5 || $50.00 || 5 || $250.00
