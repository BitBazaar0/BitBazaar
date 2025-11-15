import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();

const updateProfileValidation = [
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim(),
  body('location').optional().trim(),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

// Routes - Specific routes before parameterized routes
router.patch('/profile', authenticate, validate(updateProfileValidation), userController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordValidation), userController.changePassword);
router.get('/:id', userController.getUserProfile);
router.get('/:id/listings', userController.getUserListings);
router.get('/:id/reviews', userController.getUserReviews);

export default router;

