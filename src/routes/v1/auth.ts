import { Router } from 'express';

import { RoleType } from 'consts/RoleType';
import {
  login,
  register,
  changePassword,
  approveRegistration,
  declineRegistration,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendVerificationEmail,
} from 'controllers/auth';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';
import { validatorLogin, validatorRegister, validatorChangePassword } from 'middleware/validation/auth';

const router = Router();

router.post('/login', [validatorLogin], login);
router.post('/register', [validatorRegister], register);
router.post('/change-password', [checkJwt, validatorChangePassword], changePassword);

router.post('/forgot-password', [], forgotPassword);
router.post('/reset-password', [], resetPassword); // TODO
router.post('/verify-email', [], verifyEmail);
router.post('/send-verification-email', [], sendVerificationEmail); // send verification email again

router.post('/register/approve-registration/:id', [checkJwt, checkRole([RoleType.SUPERUSER])], approveRegistration);
router.post('/register/decline-registration/:id', [checkJwt, checkRole([RoleType.SUPERUSER])], declineRegistration);

export default router;
