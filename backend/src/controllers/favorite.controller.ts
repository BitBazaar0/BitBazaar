import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';
import prisma from '../lib/prisma';

export const getFavorites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        listing: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const favoriteListings = favorites.map((favorite) => ({
      ...favorite.listing,
      favoritedAt: favorite.createdAt
    }));

    res.json({
      status: 'success',
      data: {
        favorites: favoriteListings
      }
    });
  } catch (error) {
    next(error);
  }
};

export const addFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { listingId } = req.params;

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      throw createError('Listing not found', 404);
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: req.user.id,
        listingId
      }
    });

    if (existingFavorite) {
      throw createError('Listing already in favorites', 400);
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        listingId
      }
    });

    res.status(201).json({
      status: 'success',
      data: {
        favorite
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return next(createError('Listing already in favorites', 400));
    }
    next(error);
  }
};

export const removeFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { listingId } = req.params;

    // Check if favorite exists and delete
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: req.user.id,
        listingId
      }
    });

    if (!favorite) {
      throw createError('Favorite not found', 404);
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: {
        id: favorite.id
      }
    });

    res.json({
      status: 'success',
      message: 'Favorite removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const checkFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { listingId } = req.params;

    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: req.user.id,
        listingId
      }
    });

    res.json({
      status: 'success',
      data: {
        isFavorited: !!favorite
      }
    });
  } catch (error) {
    next(error);
  }
};
