import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';
import { ListingCreateInput, ListingFilters, PartType } from '../types';
import prisma from '../lib/prisma';

export const getListings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: ListingFilters = {
      partType: req.query.partType as PartType | undefined,
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

    // Handle partType - search takes precedence over filter if both are set
    let searchPartType: PartType | undefined;
    
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
      // Check if search term matches a part type exactly or as a common alias
      const searchUpper = filters.search.toUpperCase().trim();
      const partTypeValues: PartType[] = ['GPU', 'CPU', 'RAM', 'Motherboard', 'Storage', 'PSU', 'Case', 'Cooling', 'Peripheral', 'Monitor', 'Other'];
      const partTypeMap: Record<string, PartType> = {
        'GPU': 'GPU',
        'GRAPHICS': 'GPU',
        'GRAPHICS CARD': 'GPU',
        'VIDEO CARD': 'GPU',
        'CPU': 'CPU',
        'PROCESSOR': 'CPU',
        'RAM': 'RAM',
        'MEMORY': 'RAM',
        'MOTHERBOARD': 'Motherboard',
        'MB': 'Motherboard',
        'MOBO': 'Motherboard',
        'STORAGE': 'Storage',
        'SSD': 'Storage',
        'HDD': 'Storage',
        'PSU': 'PSU',
        'POWER': 'PSU',
        'POWER SUPPLY': 'PSU',
        'POWERSUPPLY': 'PSU',
        'CASE': 'Case',
        'PC CASE': 'Case',
        'COOLING': 'Cooling',
        'FAN': 'Cooling',
        'COOLER': 'Cooling',
        'PERIPHERAL': 'Peripheral',
        'PERIPHERALS': 'Peripheral',
        'MONITOR': 'Monitor',
        'DISPLAY': 'Monitor',
        'OTHER': 'Other'
      };
      
      // Try to find exact match first
      let matchingPartType: PartType | undefined;
      const searchKey = searchUpper.replace(/\s+/g, ' ').trim();
      
      // Check exact match in map first
      matchingPartType = partTypeMap[searchKey];
      
      // If no exact match, check if search term exactly matches a part type (exact match only, not substring)
      if (!matchingPartType) {
        matchingPartType = partTypeValues.find(pt => {
          const ptUpper = pt.toUpperCase();
          // Only exact match, not substring
          return ptUpper === searchUpper;
        });
      }
      
      // If search term matches a part type exactly, store it to filter by partType
      // This ensures "GPU" search only shows GPU listings, not PSU listings that mention GPU
      if (matchingPartType) {
        searchPartType = matchingPartType;
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

    // Apply partType filter - explicit filter selection takes precedence over search
    // If user explicitly selected a partType filter, use that (it overrides search)
    // Otherwise, if search matches a part type, use that
    if (filters.partType) {
      // User explicitly selected a partType filter - this takes precedence
      where.partType = filters.partType;
    } else if (searchPartType) {
      // Search term matched a part type, but no explicit filter was set
      where.partType = searchPartType;
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
      orderBy
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
      where: { id }
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
