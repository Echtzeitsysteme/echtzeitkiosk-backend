/* eslint-disable no-array-reduce/no-reduce */
import { faker } from '@faker-js/faker/locale/de';
import { agent as request } from 'supertest';
import { getRepository } from 'typeorm';

import { app } from '../../src';
import { config } from '../../src/config/config';
import { CustomerInvoiceStatus, CustomerInvoiceType } from '../../src/consts/CustomerInvoice';
import { CustomerInvoice } from '../../src/orm/entities/customerInvoices/CustomerInvoice';
import { CustomerOrderItem } from '../../src/orm/entities/customerOrderItems/CustomerOrderItem';
import { CustomerOrder } from '../../src/orm/entities/customerOrders/CustomerOrder';
import { Product } from '../../src/orm/entities/products/Product';
import { SystemState } from '../../src/orm/entities/systemState/SystemState';
import { User } from '../../src/orm/entities/users/User';
import { financial } from '../../src/utils/financial';
import { setupTestDBforSystemTest } from '../utils/setupTestDBforSystemTest';

(async () => {
  await setupTestDBforSystemTest();
})();

const testSuiteState = {
  superuser: {
    id: '',
    bearerToken: '',
  },
  customer1: {
    id: '',
    bearerToken: '',
    balance: 0,
    totalSpent: 0,
  },
  customer2: {
    id: '',
    bearerToken: '',
    balance: 0,
    totalSpent: 0,
  },
  systemState: {
    balance: 0,
  },
  randomOrderQuantities: {
    cola: faker.datatype.number({ min: 1, max: 10 }),
    fanta: faker.datatype.number({ min: 1, max: 10 }),
    icecream: faker.datatype.number({ min: 1, max: 10 }),
  },
  cola: {
    quantity: 0,
    price: 0,
    id: '',
  },
  fanta: {
    quantity: 0,
    price: 0,
    id: '',
  },
  icecream: {
    quantity: 0,
    price: 0,
    id: '',
  },
};

describe('System test', function () {
  test('SUPERUSER: should be able to login', async () => {
    const response = await request(app).post('/v1/auth/login').send({
      email: config.superuser.email,
      password: config.superuser.password,
    });

    expect(response.body.data).toBeTruthy();
    testSuiteState.superuser.bearerToken = response.body.data.split(' ')[1];

    expect(response.status).toBe(200);

    const users = await getRepository(User).find({ email: config.superuser.email });
    expect(users.length).toBe(1);

    testSuiteState.superuser.id = users[0].id;
  });

  test('CUSTOMER_1: should be able to register himself', async () => {
    const response = await request(app).post('/v1/auth/register').send({
      email: process.env.TEST_CUSTOMER_1_EMAIL,
      password: process.env.TEST_CUSTOMER_1_PASSWORD,
      username: 'customer1',
      firstName: 'customer1_firstName',
      lastName: 'customer1_lastName',
      language: 'de-DE',
      invitationCode: config.deployment.invitationCode,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(process.env.TEST_CUSTOMER_1_EMAIL);
    testSuiteState.customer1.id = response.body.data.id;
  });

  test('CUSTOMER_1: should not be able to login before superuser approves his account', async () => {
    const response = await request(app).post('/v1/auth/login').send({
      email: process.env.TEST_CUSTOMER_1_EMAIL,
      password: process.env.TEST_CUSTOMER_1_PASSWORD,
    });

    expect(response.status).toBe(400);
    expect(response.body.errors[0]).toBe('Registration is not approved. Please wait for admin approval');
  });

  test('SUPERUSER: should be able to approve customer1 account', async () => {
    // {{baseUrl}}/auth/register/approveRegistration/63c8b6bf-e7a0-42f7-9ccf-b2c49134f04b
    const response = await request(app)
      .post(`/v1/auth/register/approve-registration/${testSuiteState.customer1.id}`)
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(process.env.TEST_CUSTOMER_1_EMAIL);
  });

  test('CUSTOMER_1: should not be able to login until he confirms his email', async () => {
    const response = await request(app).post('/v1/auth/login').send({
      email: process.env.TEST_CUSTOMER_1_EMAIL,
      password: process.env.TEST_CUSTOMER_1_PASSWORD,
    });

    expect(response.status).toBe(404);
    expect(response.body.errors[0]).toBe('Email is not verified. Please verify your email');

    // get user from db and verify his email manually
    const user = await getRepository(User).findOne(testSuiteState.customer1.id);
    if (user) {
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        await getRepository(User).save(user);
      }
    }
  });

  test('CUSTOMER_1: should be able to login after he confirms his email', async () => {
    const response = await request(app).post('/v1/auth/login').send({
      email: process.env.TEST_CUSTOMER_1_EMAIL,
      password: process.env.TEST_CUSTOMER_1_PASSWORD,
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeTruthy();
    testSuiteState.customer1.bearerToken = response.body.data.split(' ')[1];
  });

  test('CUSTOMER_2: should be able to register himself', async () => {
    const response = await request(app).post('/v1/auth/register').send({
      email: process.env.TEST_CUSTOMER_2_EMAIL,
      password: process.env.TEST_CUSTOMER_2_PASSWORD,
      username: 'customer2',
      firstName: 'customer2_firstName',
      lastName: 'customer2_lastName',
      language: 'de-DE',
      invitationCode: config.deployment.invitationCode,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(process.env.TEST_CUSTOMER_2_EMAIL);
    testSuiteState.customer2.id = response.body.data.id;

    // get user from db and verify his email manually
    const user = await getRepository(User).findOne(testSuiteState.customer2.id);
    if (user) {
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        await getRepository(User).save(user);
      }
    }
  });

  test('SUPERUSER: should be able to decline customer2', async () => {
    const response = await request(app)
      .post(`/v1/auth/register/decline-registration/${testSuiteState.customer2.id}`)
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`);

    expect(response.status).toBe(200);

    // try to get user from db, should not exist
    const user = await getRepository(User).findOne(testSuiteState.customer2.id);
    expect(user).toBeUndefined();
  });

  test('SUPERUSER: should be able to create a new products', async () => {
    const response = await request(app)
      .post('/v1/products')
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`)
      .send({
        productTitle: 'cola',
        resalePricePerUnit: 1.234,
        quantity: 999,
      });
    expect(response.status).toBe(200);
    expect(response.body.data.productTitle).toBe('cola');
    testSuiteState.cola.price = response.body.data.resalePricePerUnit;
    testSuiteState.cola.quantity = response.body.data.quantity;
    testSuiteState.cola.id = response.body.data.id;

    const response2 = await request(app)
      .post('/v1/products')
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`)
      .send({
        productTitle: 'fanta',
        resalePricePerUnit: 0.987,
        quantity: 777,
      });
    expect(response2.status).toBe(200);
    expect(response2.body.data.productTitle).toBe('fanta');
    testSuiteState.fanta.price = response2.body.data.resalePricePerUnit;
    testSuiteState.fanta.quantity = response2.body.data.quantity;
    testSuiteState.fanta.id = response2.body.data.id;

    const randomResalePricePerUnit = faker.finance.amount(0.1, 10, 3);
    const randomQuantity = faker.datatype.number({ min: 199, max: 1999 });
    const response3 = await request(app)
      .post('/v1/products')
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`)
      .send({
        productTitle: 'icecream',
        resalePricePerUnit: Number(randomResalePricePerUnit),
        quantity: randomQuantity,
      });
    expect(response3.status).toBe(200);
    expect(response3.body.data.productTitle).toBe('icecream');
    testSuiteState.icecream.price = response3.body.data.resalePricePerUnit;
    testSuiteState.icecream.quantity = response3.body.data.quantity;
    testSuiteState.icecream.id = response3.body.data.id;

    const response4 = await request(app)
      .get('/v1/products')
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`);
    expect(response4.status).toBe(200);
    expect(response4.body.data.length).toBe(3);

    const totalQuantity = response4.body.data.reduce((acc, cur) => acc + cur.quantity, 0);

    expect(totalQuantity).toBe(
      testSuiteState.cola.quantity + testSuiteState.fanta.quantity + testSuiteState.icecream.quantity,
    );

    const totalAmount = response4.body.data.reduce(
      (acc, cur) => acc + cur.quantity * financial(cur.resalePricePerUnit),
      0,
    );

    expect(totalAmount).toBe(
      testSuiteState.cola.quantity * testSuiteState.cola.price +
        testSuiteState.fanta.quantity * testSuiteState.fanta.price +
        testSuiteState.icecream.quantity * testSuiteState.icecream.price,
    );

    // get system balance and compare
    const response5 = await request(app)
      .get('/v1/system-state/balance')
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`);

    expect(response5.status).toBe(200);
    expect(response5.body.data.balance).toBe(-financial(totalAmount));
    testSuiteState.systemState.balance = response5.body.data.balance;
  });

  test("SUPERUSER: should be able to deposit 1000€ to customer1's account with extra steps", async () => {
    const customerBefore = await getRepository(User).findOne(testSuiteState.customer1.id);
    expect(customerBefore).toBeDefined();

    const systemState = await getRepository(SystemState).findOne();

    const balanceBefore = customerBefore!.balance;
    let systemBalanceBefore = systemState!.balance;

    const response = await request(app)
      .patch(`/v1/users/${testSuiteState.customer1.id}`)
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`)
      .send({
        balance: financial(customerBefore!.balance + 1000),
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User successfully saved.');
    await new Promise((resolve) => setTimeout(resolve, 500));

    const customerAfter = await getRepository(User).findOne(testSuiteState.customer1.id);
    expect(customerAfter).toBeDefined();
    expect(customerAfter!.balance).toBe(financial(balanceBefore + 1000));

    // get system balance and compare
    const response2 = await request(app)
      .get('/v1/system-state/balance')
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`);

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(response2.status).toBe(200);
    expect(response2.body.data.balance).toBe(financial(testSuiteState.systemState.balance + 1000));
    expect(response2.body.data.balance).toBe(financial(systemBalanceBefore + 1000));
    systemBalanceBefore = response2.body.data.balance;

    // Now deposit 101.298 € to customer1's account
    const response3 = await request(app)
      .patch(`/v1/users/${testSuiteState.customer1.id}`)
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`)
      .send({
        balance: customerAfter!.balance + 101.298,
      });

    expect(response3.status).toBe(200);
    expect(response3.body.message).toBe('User successfully saved.');
    await new Promise((resolve) => setTimeout(resolve, 500));

    const customerAfter2 = await getRepository(User).findOne(testSuiteState.customer1.id);
    expect(customerAfter2).toBeDefined();
    expect(customerAfter2!.balance).toBe(financial(balanceBefore + 1000 + 101.298));

    // get system balance and compare
    const response4 = await request(app)
      .get('/v1/system-state/balance')
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`);

    expect(response4.status).toBe(200);
    expect(response4.body.data.balance).toBe(financial(systemBalanceBefore + 101.298));
    systemBalanceBefore = response4.body.data.balance;

    // Now deposit 0.001 € to customer1's account, which should add nothing to the system balance or customer1's balance
    const response5 = await request(app)
      .patch(`/v1/users/${testSuiteState.customer1.id}`)
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`)
      .send({
        balance: customerAfter2!.balance + 0.001,
      });

    expect(response5.status).toBe(200);
    expect(response5.body.message).toBe('User successfully saved.');
    await new Promise((resolve) => setTimeout(resolve, 100));

    const customerAfter3 = await getRepository(User).findOne(testSuiteState.customer1.id);
    expect(customerAfter3).toBeDefined();
    expect(customerAfter3!.balance).toBe(financial(balanceBefore + 1000 + 101.298));

    // get system balance and compare
    const response6 = await request(app)
      .get('/v1/system-state/balance')
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`);

    expect(response6.status).toBe(200);
    expect(response6.body.data.balance).toBe(financial(systemBalanceBefore));

    // Now deposit 0.005 € to customer1's account, which should add 0.01 € to the system balance and customer1's balance
    const response7 = await request(app)
      .patch(`/v1/users/${testSuiteState.customer1.id}`)
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`)
      .send({
        balance: customerAfter3!.balance + 0.005,
      });

    expect(response7.status).toBe(200);
    expect(response7.body.message).toBe('User successfully saved.');
    await new Promise((resolve) => setTimeout(resolve, 100));

    const customerAfter4 = await getRepository(User).findOne(testSuiteState.customer1.id);
    expect(customerAfter4).toBeDefined();
    expect(customerAfter4!.balance).toBe(financial(balanceBefore + 1000 + 101.298 + 0.01));

    // get system balance and compare
    const response8 = await request(app)
      .get('/v1/system-state/balance')
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`);

    expect(response8.status).toBe(200);
    expect(response8.body.data.balance).toBe(financial(systemBalanceBefore + 0.01));

    systemBalanceBefore = response8.body.data.balance;

    // Make customer1's balance 1000
    const response9 = await request(app)
      .patch(`/v1/users/${testSuiteState.customer1.id}`)
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`)
      .send({
        balance: 1000,
      });

    expect(response9.status).toBe(200);
    expect(response9.body.message).toBe('User successfully saved.');
    await new Promise((resolve) => setTimeout(resolve, 100));

    const customerAfter5 = await getRepository(User).findOne(testSuiteState.customer1.id);
    expect(customerAfter5).toBeDefined();
    expect(customerAfter5!.balance).toBe(financial(1000));

    // get system balance and compare
    const response10 = await request(app)
      .get('/v1/system-state/balance')
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`);

    expect(response10.status).toBe(200);
    expect(response10.body.data.balance).toBe(financial(systemBalanceBefore - 101.298 - 0.01));

    systemBalanceBefore = response10.body.data.balance;
    testSuiteState.customer1.balance = customerAfter5!.balance;
    testSuiteState.systemState.balance = response10.body.data.balance;
  });

  test('CUSTOMER_1: should be able to buy few products', async () => {
    // get user from db
    const user = await getRepository(User).findOne(testSuiteState.customer1.id);
    expect(user).toBeDefined();

    testSuiteState.customer1.balance = user!.balance;

    const response = await request(app)
      .post('/v1/customer-orders')
      .set('Authorization', `Bearer ${testSuiteState.customer1.bearerToken}`)
      .send({
        customerOrderItems: [
          {
            productId: testSuiteState.cola.id,
            quantity: testSuiteState.randomOrderQuantities.cola,
          },
          {
            productId: testSuiteState.fanta.id,
            quantity: testSuiteState.randomOrderQuantities.fanta,
          },
          {
            productId: testSuiteState.icecream.id,
            quantity: testSuiteState.randomOrderQuantities.icecream,
          },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(
      financial(
        testSuiteState.randomOrderQuantities.cola * testSuiteState.cola.price +
          testSuiteState.randomOrderQuantities.fanta * testSuiteState.fanta.price +
          testSuiteState.randomOrderQuantities.icecream * testSuiteState.icecream.price,
      ),
    );

    expect(response.body.data.balanceAfterOrder).toBe(
      -financial(
        testSuiteState.randomOrderQuantities.cola * financial(testSuiteState.cola.price) +
          testSuiteState.randomOrderQuantities.fanta * financial(testSuiteState.fanta.price) +
          testSuiteState.randomOrderQuantities.icecream * financial(testSuiteState.icecream.price),
      ) + financial(testSuiteState.customer1.balance),
    );

    testSuiteState.customer1.balance = response.body.data.balanceAfterOrder;

    // get products from db
    const products = await getRepository(Product).find();
    expect(products.length).toBe(3);

    const cola = products.find((p) => p.id === testSuiteState.cola.id);
    expect(cola).toBeDefined();
    expect(cola!.quantity).toBe(testSuiteState.cola.quantity - testSuiteState.randomOrderQuantities.cola);

    const fanta = products.find((p) => p.id === testSuiteState.fanta.id);
    expect(fanta).toBeDefined();
    expect(fanta!.quantity).toBe(testSuiteState.fanta.quantity - testSuiteState.randomOrderQuantities.fanta);

    const icecream = products.find((p) => p.id === testSuiteState.icecream.id);
    expect(icecream).toBeDefined();
    expect(icecream!.quantity).toBe(testSuiteState.icecream.quantity - testSuiteState.randomOrderQuantities.icecream);

    testSuiteState.cola.quantity = cola!.quantity;
    testSuiteState.fanta.quantity = fanta!.quantity;
    testSuiteState.icecream.quantity = icecream!.quantity;

    // get system balance and compare, it should be the same as before
    const response2 = await request(app)
      .get('/v1/system-state/balance')
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`);

    expect(response2.status).toBe(200);
    expect(response2.body.data.balance).toBe(testSuiteState.systemState.balance);
    testSuiteState.systemState.balance = response2.body.data.balance;

    // get customer1 balance and compare
    const response3 = await request(app)
      .get(`/v1/users/${testSuiteState.customer1.id}`)
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`);

    expect(response3.status).toBe(200);
    expect(response3.body.data.balance).toBe(testSuiteState.customer1.balance);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // get customer1 orders and compare
    const response4 = await request(app)
      .get(`/v1/customer-orders`)
      .set('Authorization', `Bearer ${testSuiteState.customer1.bearerToken}`);

    const customer1FirstOrderTotal = financial(
      testSuiteState.randomOrderQuantities.cola * financial(testSuiteState.cola.price) +
        testSuiteState.randomOrderQuantities.fanta * financial(testSuiteState.fanta.price) +
        testSuiteState.randomOrderQuantities.icecream * financial(testSuiteState.icecream.price),
    );

    expect(response4.status).toBe(200);
    expect(response4.body.data.length).toBe(1);
    expect(response4.body.data[0].user.id).toBe(testSuiteState.customer1.id);
    expect(response4.body.data[0].user.totalSpent).toBe(customer1FirstOrderTotal);
    expect(response4.body.data[0].user.balance).toBe(financial(testSuiteState.customer1.balance));
    expect(response4.body.data[0].total).toBe(customer1FirstOrderTotal);
    expect(new Date(response4.body.data[0].user.lastLogin).getTime()).toBeLessThan(new Date().getTime());

    const purchasedItems = response4.body.data[0].customerOrderItems;

    expect(purchasedItems.length).toBe(3);

    purchasedItems.forEach((element) => {
      if (element.product.id === testSuiteState.cola.id) {
        expect(element.quantity).toBe(testSuiteState.randomOrderQuantities.cola);
        expect(element.pricePerUnit).toBe(testSuiteState.cola.price);
        expect(element.subtotal).toBe(
          financial(testSuiteState.randomOrderQuantities.cola * financial(testSuiteState.cola.price)),
        );
      } else if (element.product.id === testSuiteState.fanta.id) {
        expect(element.quantity).toBe(testSuiteState.randomOrderQuantities.fanta);
        expect(element.pricePerUnit).toBe(testSuiteState.fanta.price);
        expect(element.subtotal).toBe(
          financial(testSuiteState.randomOrderQuantities.fanta * financial(testSuiteState.fanta.price)),
        );
      } else if (element.product.id === testSuiteState.icecream.id) {
        expect(element.quantity).toBe(testSuiteState.randomOrderQuantities.icecream);
        expect(element.pricePerUnit).toBe(testSuiteState.icecream.price);
        expect(element.subtotal).toBe(
          financial(testSuiteState.randomOrderQuantities.icecream * financial(testSuiteState.icecream.price)),
        );
      } else {
        fail('unexpected product');
      }
    });
  });

  test('SUPERUSER: should be able to send customer invoice to everyone', async () => {
    const response = await request(app)
      .post('/v1/customer-invoices/send-everyone')
      .set('Authorization', `Bearer ${testSuiteState.superuser.bearerToken}`);

    expect(response.status).toBe(200);

    // iterate over all customer orders. they all have a customer invoice now
    const customerOrders = await getRepository(CustomerOrder).find({
      relations: ['customerInvoice'],
    });
    expect(customerOrders.length).toBe(1);

    customerOrders.forEach((element: CustomerOrder) => {
      expect(element.customerInvoice).not.toBeNull();
    });

    // iterate over all customer invoices. they all have a customer order now
    const customerInvoices = await getRepository(CustomerInvoice).find({
      relations: ['customerOrders', 'customerOrders.customerOrderItems', 'customerOrders.customerOrderItems.product'],
    });

    expect(customerInvoices.length).toBe(1);
    expect(customerInvoices[0].customerInvoiceStatus).toBe(CustomerInvoiceStatus.SENT);
    expect(customerInvoices[0].customerInvoiceType).toBe(CustomerInvoiceType.AD_HOC);
    expect(customerInvoices[0].currentUserBalance).toBe(testSuiteState.customer1.balance);
    expect(customerInvoices[0].customerOrders.length).toBe(1);
    expect(customerInvoices[0].customerOrders[0].customerOrderItems.length).toBe(3);

    customerInvoices[0].customerOrders[0].customerOrderItems.forEach((element: CustomerOrderItem) => {
      if (element.product.id === testSuiteState.cola.id) {
        expect(element.quantity).toBe(testSuiteState.randomOrderQuantities.cola);
        expect(element.pricePerUnit).toBe(testSuiteState.cola.price);
        expect(element.subtotal).toBe(
          financial(testSuiteState.randomOrderQuantities.cola * financial(testSuiteState.cola.price)),
        );
      } else if (element.product.id === testSuiteState.fanta.id) {
        expect(element.quantity).toBe(testSuiteState.randomOrderQuantities.fanta);
        expect(element.pricePerUnit).toBe(testSuiteState.fanta.price);
        expect(element.subtotal).toBe(
          financial(testSuiteState.randomOrderQuantities.fanta * financial(testSuiteState.fanta.price)),
        );
      } else if (element.product.id === testSuiteState.icecream.id) {
        expect(element.quantity).toBe(testSuiteState.randomOrderQuantities.icecream);
        expect(element.pricePerUnit).toBe(testSuiteState.icecream.price);
        expect(element.subtotal).toBe(
          financial(testSuiteState.randomOrderQuantities.icecream * financial(testSuiteState.icecream.price)),
        );
      } else {
        fail('unexpected product');
      }
    });

    expect(customerInvoices[0].total).toBe(
      customerInvoices[0].customerOrders[0].customerOrderItems.reduce((a, b) => a + b.subtotal, 0),
    );
  });

  // TODO test customer deletion
  // TODO test product deletion
});
