import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';
import { generateToken } from '../utils/jwt.util';
import { hashPassword, comparePassword } from '../utils/bcrypt.util';
import { UserCreateInput } from '../types';
import prisma from '../lib/prisma';

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, username, password, ...rest }: UserCreateInput = req.body;

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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        ...rest
      }
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.status(201).json({
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
