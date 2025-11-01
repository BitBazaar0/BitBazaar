import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';
import prisma from '../lib/prisma';

export const getUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Get user stats
    const [userListings, userReviews] = await Promise.all([
      prisma.listing.count({
        where: {
          sellerId: id,
          isActive: true
        }
      }),
      prisma.review.findMany({
        where: {
          revieweeId: id
        }
      })
    ]);

    const averageRating =
      userReviews.length > 0
        ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
        : 0;

    const { password: _, ...userResponse } = user;

    res.json({
      status: 'success',
      data: {
        user: userResponse,
        stats: {
          totalListings: userListings,
          totalReviews: userReviews.length,
          averageRating: Number(averageRating.toFixed(2))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const updateData = req.body;

    // Update user (exclude password from updates here - handle separately if needed)
    const { password, ...safeUpdateData } = updateData;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: safeUpdateData
    });

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

export const getUserListings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { active } = req.query;

    const where: any = {
      sellerId: id
    };

    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const userListings = await prisma.listing.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      status: 'success',
      data: {
        listings: userListings
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const userReviews = await prisma.review.findMany({
      where: {
        revieweeId: id
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true
          }
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      status: 'success',
      data: {
        reviews: userReviews
      }
    });
  } catch (error) {
    next(error);
  }
};
