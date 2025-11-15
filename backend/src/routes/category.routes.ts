import express from 'express';
import * as categoryController from '../controllers/category.controller';

const router = express.Router();

// Routes - specific routes must come before parameterized routes
router.get('/', categoryController.getCategories);
router.get('/brands', categoryController.getCategoryBrands);
router.get('/:slug/brands', categoryController.getCategoryBrands);
router.get('/:slug', categoryController.getCategoryBySlug);

export default router;

