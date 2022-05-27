import { Router } from 'express';

import { RoleType } from 'consts/RoleType';
import { login, register, changePassword, approveRegistration, declineRegistration } from 'controllers/auth';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';
import { validatorLogin, validatorRegister, validatorChangePassword } from 'middleware/validation/auth';

const router = Router();

router.post('/login', [validatorLogin], login);
router.post('/register', [validatorRegister], register);
router.post('/change-password', [checkJwt, validatorChangePassword], changePassword);

//! TODO - implement these
// logout?
// forgotPassword
// resetPassword
// sendVerificationEmail
// verifyEmail

// approveRegistration @superuser
// declineRegistration @superuser

router.post('/register/approve-registration/:id', [checkJwt, checkRole([RoleType.SUPERUSER])], approveRegistration);
router.post('/register/decline-registration/:id', [checkJwt, checkRole([RoleType.SUPERUSER])], declineRegistration);

export default router;
