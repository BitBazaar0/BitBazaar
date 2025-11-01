import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma';

export const getHomepageData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    
    // Base where clause for active, non-sold listings
    const baseWhere = {
      isActive: true,
      isSold: false,
      AND: [
        {
          OR: [
            { deletedAt: null },
            { deletedAt: { gt: now } }
          ]
        },
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      ]
    };

    // Fetch all sections in parallel for better performance
    // Note: With connection pooling, parallel queries are more efficient
    const [featuredListings, trendingListings, soldListings] = await Promise.all([
      // Featured listings (newest, boosted first, limit 12)
      prisma.listing.findMany({
        where: baseWhere,
        take: 12,
        orderBy: [
          { isBoosted: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              avatar: true,
              location: true
            }
          },
          _count: {
            select: {
              favorites: true
            }
          }
        }
      }),
      
      // Trending/Most Watched (newest, most views, limit 8)
      prisma.listing.findMany({
        where: baseWhere,
        take: 8,
        orderBy: [
          { views: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              avatar: true,
              location: true
            }
          },
          _count: {
            select: {
              favorites: true
            }
          }
        }
      }),
      
      // Recently Sold (oldest sold listings, limit 8)
      prisma.listing.findMany({
        where: {
          ...baseWhere,
          isSold: true
        },
        take: 8,
        orderBy: {
          updatedAt: 'desc' // When it was marked as sold
        },
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              avatar: true,
              location: true
            }
          },
          _count: {
            select: {
              favorites: true
            }
          }
        }
      })
    ]);

    // Get total active listings count for stats
    const totalActiveListings = await prisma.listing.count({
      where: baseWhere
    });

    res.json({
      status: 'success',
      data: {
        featured: featuredListings,
        trending: trendingListings,
        recentlySold: soldListings,
        stats: {
          totalActiveListings
        }
      }
    });
  } catch (error) {
    // Handle database connection errors with a more user-friendly message
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P1001' || error.message?.includes("Can't reach database server")) {
        throw createError(
          'Database connection failed. Please check if your database is running and accessible.',
          503
        );
      }
    }
    next(error);
  }
};

