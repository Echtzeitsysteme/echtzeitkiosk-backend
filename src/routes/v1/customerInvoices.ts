import { Router } from 'express';

import { RoleType } from 'consts';
import {
  //  show, edit, destroy
  generateCustomerInvoicePDF,
  list,
  sendCustomerInvoiceToEveryone,
  sendCustomerInvoiceToUser,
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

router.post(
  '/send-everyone',
  [checkJwt, checkRole([RoleType.SUPERUSER, RoleType.STANDARD])],
  sendCustomerInvoiceToEveryone,
);
router.post(
  '/send-to/:userId',
  [checkJwt, checkRole([RoleType.SUPERUSER, RoleType.STANDARD])],
  sendCustomerInvoiceToUser,
);

export default router;
