import { Router } from 'express';

import { RoleType } from 'consts/RoleType';
import { list, show, edit, destroy, create } from 'controllers/suppliers';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';

const router = Router();

router.get('/', [checkJwt, checkRole([RoleType.SUPERUSER])], list);

router.post('/', [checkJwt, checkRole([RoleType.SUPERUSER])], create);

router.get('/:id', [checkJwt, checkRole([RoleType.SUPERUSER])], show);

router.patch('/:id', [checkJwt, checkRole([RoleType.SUPERUSER])], edit);

router.delete('/:id', [checkJwt, checkRole([RoleType.SUPERUSER])], destroy);

export default router;
