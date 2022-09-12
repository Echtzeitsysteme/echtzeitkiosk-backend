import { Router } from 'express';
// import {
//   // validatorEdit,
//   validatorCreate,
// } from 'middleware/validation/products';

import { RoleType } from 'consts/RoleType';
import { list, show, edit, destroy, create } from 'controllers/products';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';

const router = Router();
// CRUD functions
router.get('/', [checkJwt, checkRole([RoleType.SUPERUSER, RoleType.STANDARD])], list);

router.post('/', [checkJwt, checkRole([RoleType.SUPERUSER])], create);

router.get('/:id', [checkJwt, checkRole([RoleType.SUPERUSER, RoleType.STANDARD])], show);

router.patch('/:id', [checkJwt, checkRole([RoleType.SUPERUSER])], edit);

router.delete('/:id', [checkJwt, checkRole([RoleType.SUPERUSER])], destroy);

export default router;
