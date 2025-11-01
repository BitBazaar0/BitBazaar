import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';
import { ReviewCreateInput } from '../types';
import prisma from '../lib/prisma';

export const getUserReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const userReviews = await prisma.review.findMany({
      where: {
        revieweeId: userId
      },
      include: {
        listing: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate average rating
    const averageRating =
      userReviews.length > 0
        ? userReviews.reduce((sum: number, r: typeof userReviews[0]) => sum + r.rating, 0) / userReviews.length
        : 0;

    res.json({
      status: 'success',
      data: {
        reviews: userReviews,
        averageRating: Number(averageRating.toFixed(2)),
        totalReviews: userReviews.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getListingReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { listingId } = req.params;

    const listingReviews = await prisma.review.findMany({
      where: {
        listingId
      },
      include: {
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
        reviews: listingReviews
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { listingId, rating, comment }: ReviewCreateInput & { listingId: string } = req.body;

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      throw createError('Listing not found', 404);
    }

    // Check if user can review (must be buyer)
    // In real app, we'd check transaction history
    // For now, just check that reviewer is not the seller
    if (listing.sellerId === req.user.id) {
      throw createError('Cannot review your own listing', 400);
    }

    // Check if user already reviewed this listing
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: req.user.id,
        listingId
      }
    });

    if (existingReview) {
      throw createError('You have already reviewed this listing', 400);
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        listingId,
        reviewerId: req.user.id,
        revieweeId: listing.sellerId,
        rating,
        comment
      }
    });

    res.status(201).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { id } = req.params;
    const { rating, comment } = req.body;

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw createError('Review not found', 404);
    }

    // Check ownership
    if (review.reviewerId !== req.user.id) {
      throw createError('Not authorized to update this review', 403);
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: rating ?? review.rating,
        comment: comment !== undefined ? comment : review.comment
      }
    });

    res.json({
      status: 'success',
      data: {
        review: updatedReview
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { id } = req.params;

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw createError('Review not found', 404);
    }

    // Check ownership
    if (review.reviewerId !== req.user.id) {
      throw createError('Not authorized to delete this review', 403);
    }

    // Delete review
    await prisma.review.delete({
      where: { id }
    });

    res.json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
