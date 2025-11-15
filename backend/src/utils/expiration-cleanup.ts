import prisma from '../lib/prisma';
import logger from './logger';

/**
 * Cleanup expired listings
 * - After 3 weeks: Mark as inactive (expired but kept for re-listing)
 * - After 5 weeks: Permanently delete from database
 * 
 * This should be run as a scheduled job (cron) daily
 */
export const cleanupExpiredListings = async () => {
  try {
    const now = new Date();

    // Step 1: Mark listings that expired 3 minutes ago as inactive (for testing)
    // TODO: Change back to 3 weeks in production (3 * 7 * 24 * 60 * 60 * 1000)
    // (They're past expiresAt but not yet at deletedAt)
    const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000); // 3 minutes ago (for testing)
    
    const expiredResult = await prisma.listing.updateMany({
      where: {
        expiresAt: {
          lte: threeMinutesAgo
        },
        isActive: true,
        isSold: false,
        deletedAt: {
          gt: now // Not yet at permanent deletion date
        }
      },
      data: {
        isActive: false // Deactivate but keep in database
      }
    });

    if (expiredResult.count > 0) {
      logger.info(`Deactivated ${expiredResult.count} expired listings`);
    }

    // Step 2: Permanently delete listings past deletion date
    const permanentlyDeleted = await prisma.listing.deleteMany({
      where: {
        deletedAt: {
          lte: now // Past the permanent deletion date
        }
      }
    });

    if (permanentlyDeleted.count > 0) {
      logger.info(`Permanently deleted ${permanentlyDeleted.count} listings`);
    }

    return {
      expired: expiredResult.count,
      deleted: permanentlyDeleted.count
    };
  } catch (error) {
    logger.error('Error cleaning up expired listings:', error);
    throw error;
  }
};

/**
 * Run cleanup (can be called manually or scheduled)
 */
if (require.main === module) {
  cleanupExpiredListings()
    .then((result) => {
      logger.info('Cleanup complete:', result);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Cleanup failed:', error);
      process.exit(1);
    });
}

