import express from 'express';
import * as favoriteController from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Routes
router.get('/', authenticate, favoriteController.getFavorites);
router.post('/:listingId', authenticate, favoriteController.addFavorite);
router.delete('/:listingId', authenticate, favoriteController.removeFavorite);
router.get('/check/:listingId', authenticate, favoriteController.checkFavorite);

export default router;

