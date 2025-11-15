import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { createError } from './errorHandler';
import logger from '../utils/logger';

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Verify reCAPTCHA token middleware
 * Validates the reCAPTCHA token from the request body
 */
export const verifyRecaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip in development if RECAPTCHA_SECRET_KEY is not set
    if (process.env.NODE_ENV === 'development' && !process.env.RECAPTCHA_SECRET_KEY) {
      logger.warn('reCAPTCHA verification skipped - RECAPTCHA_SECRET_KEY not set (development mode)');
      return next();
    }

    const recaptchaToken = req.body.recaptchaToken;

    if (!recaptchaToken) {
      throw createError('reCAPTCHA verification required', 400);
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      logger.error('RECAPTCHA_SECRET_KEY is not configured');
      throw createError('reCAPTCHA is not properly configured', 500);
    }

    // Verify token with Google
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await axios.post<RecaptchaResponse>(
      verificationUrl,
      null,
      {
        params: {
          secret: secretKey,
          response: recaptchaToken,
          remoteip: req.ip || req.connection.remoteAddress
        }
      }
    );

    const { success, 'error-codes': errorCodes } = response.data;

    if (!success) {
      logger.warn(`reCAPTCHA verification failed: ${errorCodes?.join(', ') || 'unknown error'}`);
      throw createError('reCAPTCHA verification failed. Please try again.', 400);
    }

    // Verification successful, continue to next middleware
    next();
  } catch (error: any) {
    // If it's already an AppError, pass it through
    if (error.statusCode) {
      return next(error);
    }

    // Otherwise, wrap it
    logger.error('reCAPTCHA verification error:', error);
    next(createError('reCAPTCHA verification failed. Please try again.', 400));
  }
};

