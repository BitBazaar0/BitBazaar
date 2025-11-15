import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

/**
 * Get all categories
 * GET /api/categories
 */
export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        displayName: true,
        icon: true,
        color: true
      }
    });

    res.json({
      status: 'success',
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single category by slug
 * GET /api/categories/:slug
 */
export const getCategoryBySlug = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            listings: {
              where: {
                isActive: true,
                isSold: false
              }
            }
          }
        }
      }
    });

    if (!category) {
      res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
      return;
    }

    res.json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get popular brands for a category (or all categories)
 * GET /api/categories/:slug/brands
 * GET /api/categories/brands?categorySlug=gpu
 */
export const getCategoryBrands = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categorySlug = req.params.slug || req.query.categorySlug as string;
    const limit = Number(req.query.limit) || 10;
    
    const now = new Date();
    const baseWhere: any = {
      isActive: true,
      isSold: false,
      brand: { not: null }, // Only listings with brands
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

    // If categorySlug provided, filter by category
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true }
      });

      if (category) {
        baseWhere.categoryId = category.id;
      }
    }

    // Get distinct brands with counts, ordered by popularity (count)
    const brands = await prisma.listing.groupBy({
      by: ['brand'],
      where: baseWhere,
      _count: {
        brand: true
      },
      orderBy: {
        _count: {
          brand: 'desc'
        }
      },
      take: limit
    });

    // Format response: extract brand names and counts
    const brandList = brands
      .filter(b => b.brand) // Remove any null values
      .map(b => ({
        name: b.brand!,
        count: b._count.brand
      }));

    res.json({
      status: 'success',
      data: {
        brands: brandList,
        categorySlug: categorySlug || null
      }
    });
  } catch (error) {
    next(error);
  }
};

