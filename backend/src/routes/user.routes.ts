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

// Routes
router.get('/:id', userController.getUserProfile);
router.patch('/profile', authenticate, validate(updateProfileValidation), userController.updateProfile);
router.get('/:id/listings', userController.getUserListings);
router.get('/:id/reviews', userController.getUserReviews);

export default router;

