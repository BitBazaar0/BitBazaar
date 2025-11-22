import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';
import prisma from '../lib/prisma';

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { limit = '20', offset = '0' } = req.query;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.notification.count({
      where: { userId },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      status: 'success',
      data: {
        notifications,
        total,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Find notification and verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw createError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw createError('Not authorized to update this notification', 403);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({
      status: 'success',
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Find notification and verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw createError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw createError('Not authorized to delete this notification', 403);
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    res.json({
      status: 'success',
      data: {
        count,
      },
    });
  } catch (error) {
    next(error);
  }
};
