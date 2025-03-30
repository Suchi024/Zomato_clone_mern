import express from 'express'
import { body } from 'express-validator'
import { authProvider } from '../middlewares/auth.provider.middleware.js';
import { loginProvider, registerProvider, logoutProvider, refreshAccessToken, ForgetPassword, resetPassword } from '../controllers/provider.controller.js';


const router = express.Router();

router.route("/register")
    .post(
        body('fullname.firstname').notEmpty().withMessage('First name is required'),
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('phoneNo').isMobilePhone('en-IN').withMessage('Invalid phone number'),
        registerProvider
    );

router.post(
    "/login-provider",
    [
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    loginProvider
);

router.route('/logout')
    .post(authProvider, logoutProvider);




    router.route("/refresh-Token")
    .post(
        body('refreshToken').notEmpty().withMessage('Refresh token is required'),
        refreshAccessToken
    );

router.route("/forget-password").post(
    body('email').isEmail().withMessage('Invalid email format'),
    ForgetPassword
);

router.route("/reset-password")
    .post(
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        resetPassword
    );
export default router;