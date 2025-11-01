import express from 'express';
import { body, query } from 'express-validator';
import * as listingController from '../controllers/listing.controller';
import * as homepageController from '../controllers/homepage.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();

const createListingValidation = [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('partType').isIn(['GPU', 'CPU', 'RAM', 'Motherboard', 'Storage', 'PSU', 'Case', 'Cooling', 'Peripheral', 'Monitor', 'Other']).withMessage('Invalid part type'),
  body('condition').isIn(['new', 'used', 'refurbished']).withMessage('Invalid condition'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('brand').optional().trim(),
  body('model').optional().trim(),
  body('images').isArray().withMessage('Images must be an array'),
  body('images.*').isString().withMessage('Each image must be a URL string')
];

const updateListingValidation = [
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('images').optional().isArray()
];

// Routes
router.get('/homepage', optionalAuth, homepageController.getHomepageData);
router.get('/', optionalAuth, listingController.getListings);
router.get('/:id', optionalAuth, listingController.getListingById);
router.post('/', authenticate, validate(createListingValidation), listingController.createListing);
router.patch('/:id', authenticate, validate(updateListingValidation), listingController.updateListing);
router.delete('/:id', authenticate, listingController.deleteListing);
router.post('/:id/sold', authenticate, listingController.markAsSold);
router.post('/:id/view', optionalAuth, listingController.incrementView);

export default router;

