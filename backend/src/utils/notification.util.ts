import prisma from '../lib/prisma';
import { Server } from 'socket.io';
import logger from './logger';

export type NotificationType = 'MESSAGE' | 'LISTING_SOLD' | 'REVIEW' | 'FAVORITE' | 'SYSTEM';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  io?: Server; // Socket.IO instance for real-time notifications
}

/**
 * Create a notification for a user
 * Optionally sends real-time notification via Socket.IO
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  link,
  io,
}: CreateNotificationParams) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });

    // If Socket.IO instance is provided, emit real-time notification
    if (io) {
      io.to(`user:${userId}`).emit('new-notification', notification);
    }

    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create notification when a new message is received
 */
export const notifyNewMessage = async (
  userId: string,
  senderName: string,
  chatId: string,
  io?: Server
) => {
  return createNotification({
    userId,
    type: 'MESSAGE',
    title: 'New Message',
    message: `You have a new message from ${senderName}`,
    link: `/chat?chatId=${chatId}`,
    io,
  });
};

/**
 * Create notification when a listing is sold
 */
export const notifyListingSold = async (
  userId: string,
  listingTitle: string,
  io?: Server
) => {
  return createNotification({
    userId,
    type: 'LISTING_SOLD',
    title: 'Listing Sold',
    message: `Your listing "${listingTitle}" has been marked as sold`,
    link: `/my-listings`,
    io,
  });
};

/**
 * Create notification when receiving a review
 */
export const notifyNewReview = async (
  userId: string,
  reviewerName: string,
  rating: number,
  io?: Server
) => {
  return createNotification({
    userId,
    type: 'REVIEW',
    title: 'New Review',
    message: `${reviewerName} left you a ${rating}-star review`,
    link: `/profile/${userId}`,
    io,
  });
};

/**
 * Create notification when someone favorites your listing
 */
export const notifyListingFavorited = async (
  userId: string,
  listingTitle: string,
  listingId: string,
  io?: Server
) => {
  return createNotification({
    userId,
    type: 'FAVORITE',
    title: 'Listing Favorited',
    message: `Someone favorited your listing "${listingTitle}"`,
    link: `/listings/${listingId}`,
    io,
  });
};

/**
 * Create system notification
 */
export const notifySystem = async (
  userId: string,
  title: string,
  message: string,
  link?: string,
  io?: Server
) => {
  return createNotification({
    userId,
    type: 'SYSTEM',
    title,
    message,
    link,
    io,
  });
};
