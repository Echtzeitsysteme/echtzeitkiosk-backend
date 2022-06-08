import { getRepository } from 'typeorm';

import { CustomerInvoiceType } from 'consts/CustomerInvoiceType';
import { CustomerInvoice } from 'orm/entities/customerInvoices/CustomerInvoice';
import { CustomerOrder } from 'orm/entities/customerOrders/CustomerOrder';
import { User } from 'orm/entities/users/User';

export const test = () => {
  console.log('test');
};

// iterate over all users. For each user, check if the user has a customer invoice for the current month. If not, create a new customer invoice for the user. If the user has a customer invoice for the current month, then skip it. And then iterate over all customer orders for the user and then update the customer invoice balance and content.
export const generateMonthlyInvoices = async () => {
  console.log('generateMonthlyInvoices');

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

// iterate over all customer invoices which are created for the last month and then send an invoice email to each user
export const sendMonthlyInvoicesToCustomers = async () => {
  console.log('sendMonthlyInvoicesToCustomers');

  const customerInvoices = await getRepository(CustomerInvoice)
    .createQueryBuilder('customerInvoice')
    .leftJoinAndSelect('customerInvoice.user', 'user')
    .leftJoinAndSelect('customerInvoice.customerOrders', 'customerOrders')
    .where('customerInvoice.customerInvoiceType = :customerInvoiceType', {
      customerInvoiceType: CustomerInvoiceType.MONTHLY,
    })
    .andWhere('customerInvoice.customerInvoiceMonthYear = :customerInvoiceMonthYear', {
      customerInvoiceMonthYear: new Date().getMonth() + 1 + '-' + new Date().getFullYear(),
    })
    .getMany();

  //   console.log('customerInvoices', customerInvoices);

  // send email to each user
  customerInvoices.forEach((customerInvoice) => {
    console.log('customerInvoice', customerInvoice);
  });

  // wait 5 seconds
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
};
