import { Router } from 'express';

import { RoleType } from 'consts';
import {
  //  show, edit, destroy
  generateCustomerInvoicePDF,
  list,
} from 'controllers/customerInvoices';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';

const router = Router();

// router.get('/:id', [checkJwt, checkRole([RoleType.SUPERUSER], true)], show);

// router.patch('/:id', [checkJwt, checkRole([RoleType.SUPERUSER], true)], edit);

// router.delete('/:id', [checkJwt, checkRole([RoleType.SUPERUSER], true)], destroy);

router.get(
  '/:id/generate-customer-invoice-pdf',
  // [checkJwt, checkRole([RoleType.STANDARD])], // TODO: implement this after implementing the frontendURL in the customerInvoice email
  generateCustomerInvoicePDF,
);

router.get('/', [checkJwt, checkRole([RoleType.SUPERUSER, RoleType.STANDARD])], list);

export default router;
