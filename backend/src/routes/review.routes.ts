import express from 'express';
import { body } from 'express-validator';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();

const createReviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must not exceed 1000 characters'),
  body('listingId').notEmpty().withMessage('Listing ID is required')
];

// Routes
router.get('/user/:userId', reviewController.getUserReviews);
router.get('/listing/:listingId', reviewController.getListingReviews);
router.post('/', authenticate, validate(createReviewValidation), reviewController.createReview);
router.patch('/:id', authenticate, validate(createReviewValidation), reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

export default router;

