import { Router } from 'express';

import { RoleType } from 'consts/RoleType';
import {
  list,
  create,
  // show, edit, destroy
} from 'controllers/customerOrders';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';

const router = Router();

router.post('/', [checkJwt, checkRole([RoleType.STANDARD])], create);

router.get('/', [checkJwt, checkRole([RoleType.SUPERUSER, RoleType.STANDARD])], list);

// router.get('/:id', [checkJwt, checkRole([RoleType.SUPERUSER, RoleType.STANDARD])], show);

// router.patch('/:id', [checkJwt, checkRole([RoleType.SUPERUSER])], edit);

// router.delete('/:id', [checkJwt, checkRole([RoleType.SUPERUSER])], destroy);

export default router;
