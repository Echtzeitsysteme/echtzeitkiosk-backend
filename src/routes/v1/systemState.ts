import { Router } from 'express';

import { RoleType } from 'consts/RoleType';
import { editBalance, showBalance } from 'controllers/systemState';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';

const router = Router();

router
  .route('/balance')
  .get([checkJwt, checkRole([RoleType.SUPERUSER])], showBalance)
  .patch([checkJwt, checkRole([RoleType.SUPERUSER])], editBalance);

export default router;
