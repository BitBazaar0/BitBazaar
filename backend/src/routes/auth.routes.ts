import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { verifyRecaptcha } from '../middleware/recaptcha.middleware';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim(),
  body('location').optional().trim()
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const resendVerificationValidation = [
  body('email').isEmail().withMessage('Please provide a valid email')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Routes
router.post('/register', verifyRecaptcha, validate(registerValidation), authController.register);
router.post('/login', verifyRecaptcha, validate(loginValidation), authController.login);
router.get('/me', authenticate, authController.getMe);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', verifyRecaptcha, validate(resendVerificationValidation), authController.resendVerification);
router.post('/forgot-password', verifyRecaptcha, validate(forgotPasswordValidation), authController.forgotPassword);
router.post('/reset-password', verifyRecaptcha, validate(resetPasswordValidation), authController.resetPassword);

export default router;

