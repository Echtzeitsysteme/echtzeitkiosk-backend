import { Router } from 'express';

import auth from './auth';
import customerInvoices from './customerInvoices';
import customerOrders from './customerOrders';
import products from './products';
import suppliers from './suppliers';
import systemState from './systemState';
import users from './users';

const router = Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/customer-invoices', customerInvoices);
router.use('/customer-orders', customerOrders);
router.use('/products', products);
router.use('/system-state', systemState);
router.use('/suppliers', suppliers);

export default router;
