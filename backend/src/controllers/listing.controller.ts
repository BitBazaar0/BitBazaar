import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';
import { ListingCreateInput, ListingFilters } from '../types';
import prisma from '../lib/prisma';
import { sendEmail } from '../utils/email.service';

export const getListings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: ListingFilters = {
      categoryId: req.query.categoryId as string | undefined,
      categorySlug: req.query.categorySlug as string | undefined,
      brand: req.query.brand as string | undefined,
      condition: req.query.condition as 'new' | 'used' | 'refurbished' | undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      location: req.query.location as string | undefined,
      search: req.query.search as string | undefined,
      sellerId: req.query.sellerId as string | undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : true
    };

    // Build Prisma where clause
    const now = new Date();
    const where: any = {
      isActive: filters.isActive,
      isSold: false, // Exclude sold listings from public view
      AND: [
        {
          OR: [
            { deletedAt: null }, // Include listings without deletion date (legacy)
            { deletedAt: { gt: now } } // Include listings that haven't been permanently deleted yet
          ]
        },
        {
          OR: [
            { expiresAt: null }, // Include listings without expiration (legacy)
            { expiresAt: { gt: now } } // Include listings that haven't expired yet
          ]
        }
      ]
    };

    // Handle category search - check if search term matches a category
    let searchCategoryId: string | undefined;
    
    if (filters.brand) {
      where.brand = {
        contains: filters.brand,
        mode: 'insensitive'
      };
    }

    if (filters.condition) {
      where.condition = filters.condition;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive'
      };
    }

    if (filters.search) {
      // Check if search term matches a category name or slug
      const searchTerm = filters.search.trim();
      
      // Try to find category by name or slug (case-insensitive)
      const matchingCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: searchTerm, mode: 'insensitive' } },
            { slug: { equals: searchTerm.toLowerCase(), mode: 'insensitive' } },
            { displayName: { equals: searchTerm, mode: 'insensitive' } }
          ],
          isActive: true
        },
        select: { id: true }
      });
      
      if (matchingCategory) {
        // If search term matches a category exactly, filter by category
        // This ensures "GPU" search only shows GPU listings, not listings that mention GPU in description
        searchCategoryId = matchingCategory.id;
      } else {
        // Otherwise, do text search across title, description, brand, model
        where.AND.push({
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { brand: { contains: filters.search, mode: 'insensitive' } },
            { model: { contains: filters.search, mode: 'insensitive' } }
          ]
        });
      }
    }

    if (filters.sellerId) {
      where.sellerId = filters.sellerId;
    }

    // Apply category filter - priority: categorySlug > categoryId > searchCategoryId
    let categoryIdToFilter: string | undefined;
    
    // 1. Check categorySlug first (highest priority)
    if (filters.categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: filters.categorySlug },
        select: { id: true }
      });
      if (category) {
        categoryIdToFilter = category.id;
      }
    }
    // 2. Check categoryId
    else if (filters.categoryId) {
      categoryIdToFilter = filters.categoryId;
    }
    // 3. Check searchCategoryId (from search term matching a category)
    else if (searchCategoryId) {
      categoryIdToFilter = searchCategoryId;
    }
    
    // Apply categoryId filter if we found one
    if (categoryIdToFilter) {
      where.categoryId = categoryIdToFilter;
    }

    // Get total count for pagination
    const totalItems = await prisma.listing.count({ where });

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Sort option
    const sort = req.query.sort as string || 'newest';
    
    // Build orderBy based on sort option
    let orderBy: any[] = [];
    switch (sort) {
      case 'price-low':
        orderBy = [{ isBoosted: 'desc' }, { price: 'asc' }];
        break;
      case 'price-high':
        orderBy = [{ isBoosted: 'desc' }, { price: 'desc' }];
        break;
      case 'oldest':
        orderBy = [{ isBoosted: 'desc' }, { createdAt: 'asc' }];
        break;
      case 'newest':
      case 'recently-added':
      default:
        orderBy = [{ isBoosted: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const listings = await prisma.listing.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            displayName: true,
            color: true
          }
        }
      }
    });

    // Set cache-control headers to prevent 304 Not Modified responses
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      status: 'success',
      data: {
        listings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getListingById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            displayName: true,
            color: true
          }
        }
      }
    });

    if (!listing) {
      throw createError('Listing not found', 404);
    }

    res.json({
      status: 'success',
      data: {
        listing
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createListing = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    // Verify user exists in database (in case JWT has stale ID)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      throw createError('User not found. Please log in again.', 401);
    }

    const listingData: ListingCreateInput = req.body;

    // Validate categoryId exists
    if (!listingData.categoryId) {
      throw createError('categoryId is required', 400);
    }

    const category = await prisma.category.findUnique({
      where: { id: listingData.categoryId },
      select: { id: true, isActive: true }
    });

    if (!category) {
      throw createError('Category not found', 400);
    }

    if (!category.isActive) {
      throw createError('Cannot create listing with inactive category', 400);
    }

    // Set expiration dates: 3 minutes for expiration, 5 minutes for permanent deletion (for testing)
    // TODO: Change back to weeks in production (3 weeks = 3 * 7 * 24 * 60 * 60 * 1000, 5 weeks = 5 * 7 * 24 * 60 * 60 * 1000)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3 * 7 * 24 * 60 * 60 * 1000);
    const deletedAt = new Date(now.getTime() + 5 * 7 * 24 * 60 * 60 * 1000);
    
    const listing = await prisma.listing.create({
      data: {
        ...listingData,
        sellerId: user.id,
        expiresAt,
        deletedAt
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            displayName: true,
            color: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: {
        listing
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if listing exists and user owns it
    const existingListing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!existingListing) {
      throw createError('Listing not found', 404);
    }

    if (existingListing.sellerId !== req.user.id) {
      throw createError('Not authorized to update this listing', 403);
    }

    // Update listing
    const listing = await prisma.listing.update({
      where: { id },
      data: updateData
    });

    res.json({
      status: 'success',
      data: {
        listing
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { id } = req.params;

    // Check if listing exists and user owns it
    const listing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!listing) {
      throw createError('Listing not found', 404);
    }

    if (listing.sellerId !== req.user.id) {
      throw createError('Not authorized to delete this listing', 403);
    }

    // Soft delete - set isActive to false
    await prisma.listing.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      status: 'success',
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const markAsSold = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { id } = req.params;

    // Find listing and verify ownership
    const listing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!listing) {
      throw createError('Listing not found', 404);
    }

    if (listing.sellerId !== req.user.id) {
      throw createError('You can only mark your own listings as sold', 403);
    }

    if (listing.isSold) {
      throw createError('Listing is already marked as sold', 400);
    }

    // Mark as sold and deactivate
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        isSold: true,
        isActive: false
      }
    });

    res.json({
      status: 'success',
      data: {
        listing: updatedListing
      }
    });
  } catch (error) {
    next(error);
  }
};

export const incrementView = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    });

    res.json({
      status: 'success',
      data: {
        views: listing.views
      }
    });
  } catch (error) {
    next(error);
  }
};
