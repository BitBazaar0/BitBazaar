import express from 'express';
import { body } from 'express-validator';
import * as chatController from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();

const sendMessageValidation = [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message content must be between 1 and 2000 characters'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be valid')
];

const createChatValidation = [
  body('listingId').notEmpty().withMessage('Listing ID is required'),
  body('content')
    .optional()
    .custom((value) => {
      // If content is provided, validate it; otherwise allow undefined/empty
      if (value === undefined || value === null || value === '') {
        return true;
      }
      const trimmed = String(value).trim();
      if (trimmed.length < 1 || trimmed.length > 2000) {
        throw new Error('Message content must be between 1 and 2000 characters');
      }
      return true;
    }),
  body('imageUrl')
    .optional()
    .custom((value) => {
      // If imageUrl is provided, validate it's a URL; otherwise allow undefined/empty
      if (value === undefined || value === null || value === '') {
        return true;
      }
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Image URL must be valid');
      }
    })
];

// Routes
router.get('/', authenticate, chatController.getUserChats);
router.get('/:chatId', authenticate, chatController.getChatMessages);
router.post('/', authenticate, validate(createChatValidation), chatController.createOrGetChat);
router.post('/:chatId/messages', authenticate, validate(sendMessageValidation), chatController.sendMessage);

export default router;

