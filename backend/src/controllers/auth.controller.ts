import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';
import { generateToken } from '../utils/jwt.util';
import { hashPassword, comparePassword } from '../utils/bcrypt.util';
import { UserCreateInput } from '../types';
import prisma from '../lib/prisma';
import { generateVerificationToken, generateResetToken, getTokenExpiry, isTokenExpired } from '../utils/token.util';
import { sendEmail, getVerificationEmail, getPasswordResetEmail } from '../utils/email.service';
import logger from '../utils/logger';

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, username, password, recaptchaToken, ...rest }: UserCreateInput & { recaptchaToken?: string } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw createError('User with this email or username already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user (exclude recaptchaToken - it's only for verification, not storage)
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        verificationToken,
        ...rest
      }
    });

    // Send verification email
    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Verify your BitBazaar email address',
      html: getVerificationEmail(verificationToken, user.username),
    });

    if (!emailSent) {
      // Log error but don't fail registration - user can request resend
      logger.warn(`Failed to send verification email to ${user.email}. User created successfully.`);
    }

    // Remove password and sensitive data from response
    const { password: _, verificationToken: __, resetToken: ___, resetTokenExpiry: ____, ...userResponse } = user;

    // DO NOT generate token - user must verify email first
    res.status(201).json({
      status: 'success',
      data: {
        user: userResponse,
        emailSent // Let frontend know if email was sent
      },
      message: emailSent 
        ? 'Registration successful! Please check your email to verify your account before logging in.'
        : 'Registration successful! However, we could not send the verification email. Please use the resend option.'
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw createError('Please verify your email address before logging in. Check your inbox for the verification link.', 403);
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      status: 'success',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const { password: _, ...userResponse } = user;

    res.json({
      status: 'success',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email address
 * GET /api/auth/verify-email?token=...
 */
export const verifyEmail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throw createError('Verification token is required', 400);
    }

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      throw createError('Invalid or expired verification token', 400);
    }

    if (user.emailVerified) {
      throw createError('Email already verified', 400);
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null // Clear token after verification
      }
    });

    res.json({
      status: 'success',
      message: 'Email verified successfully!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export const resendVerification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError('Email is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      res.json({
        status: 'success',
        message: 'If an account exists with this email, a verification email has been sent.'
      });
      return;
    }

    if (user.emailVerified) {
      throw createError('Email already verified', 400);
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken }
    });

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: 'Verify your BitBazaar email address',
      html: getVerificationEmail(verificationToken, user.username),
    });

    res.json({
      status: 'success',
      message: 'Verification email sent! Please check your inbox.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError('Email is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      res.json({
        status: 'success',
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
      return;
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = getTokenExpiry(1); // 1 hour expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send password reset email
    await sendEmail({
      to: user.email,
      subject: 'Reset your BitBazaar password',
      html: getPasswordResetEmail(resetToken, user.username),
    });

    res.json({
      status: 'success',
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw createError('Token and password are required', 400);
    }

    if (password.length < 6) {
      throw createError('Password must be at least 6 characters', 400);
    }

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: { resetToken: token }
    });

    if (!user) {
      throw createError('Invalid or expired reset token', 400);
    }

    // Check if token is expired
    if (isTokenExpired(user.resetTokenExpiry)) {
      throw createError('Reset token has expired. Please request a new one.', 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({
      status: 'success',
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};
