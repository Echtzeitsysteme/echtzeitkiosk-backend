import { Router } from 'express';

import { RoleType } from 'consts/RoleType';
import { list, show, edit, destroy } from 'controllers/users';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';
import { validatorEdit } from 'middleware/validation/users';

const router = Router();

router.get('/', [checkJwt, checkRole([RoleType.SUPERUSER])], list);

router.get('/:id', [checkJwt, checkRole([RoleType.SUPERUSER], true)], show);

router.patch('/:id', [checkJwt, checkRole([RoleType.SUPERUSER], true), validatorEdit], edit);

router.delete('/:id', [checkJwt, checkRole([RoleType.SUPERUSER], true)], destroy);

export default router;
