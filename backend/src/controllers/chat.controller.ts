import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';
import { MessageCreateInput } from '../types';
import { Server } from 'socket.io';
import prisma from '../lib/prisma';

export const getUserChats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    // Get all chats where user is buyer or seller
    const userChats = await prisma.chat.findMany({
      where: {
        OR: [
          { buyerId: req.user.id },
          { sellerId: req.user.id }
        ]
      },
      include: {
        listing: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Get unread counts for each chat
    const chatsWithDetails = await Promise.all(
      userChats.map(async (chat: typeof userChats[0]) => {
        const unreadCount = await prisma.message.count({
          where: {
            chatId: chat.id,
            senderId: { not: req.user!.id },
            isRead: false
          }
        });

        return {
          ...chat,
          lastMessage: chat.messages[0] || null,
          unreadCount
        };
      })
    );

    res.json({
      status: 'success',
      data: {
        chats: chatsWithDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getChatMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { chatId } = req.params;

    // Check if chat exists and user is part of it
    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      throw createError('Chat not found', 404);
    }

    if (chat.buyerId !== req.user.id && chat.sellerId !== req.user.id) {
      throw createError('Not authorized to view this chat', 403);
    }

    // Get messages
    const chatMessages = await prisma.message.findMany({
      where: {
        chatId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: req.user.id },
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({
      status: 'success',
      data: {
        messages: chatMessages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createOrGetChat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { listingId, content, imageUrl } = req.body;

    if (!listingId) {
      throw createError('Listing ID is required', 400);
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      throw createError('Listing not found', 404);
    }

    if (listing.sellerId === req.user.id) {
      throw createError('Cannot create chat for your own listing', 400);
    }

    // Check if chat already exists or create new one
    let chat = await prisma.chat.findFirst({
      where: {
        listingId,
        buyerId: req.user.id
      }
    });

    if (!chat) {
      // Create new chat
      chat = await prisma.chat.create({
        data: {
          listingId,
          buyerId: req.user.id,
          sellerId: listing.sellerId
        }
      });
    }

    // If content is provided, send initial message
    if (content) {
      const message = await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: req.user.id,
          content,
          imageUrl
        }
      });

      // Update chat updatedAt
      await prisma.chat.update({
        where: { id: chat.id },
        data: { updatedAt: new Date() }
      });

      // Emit socket event
      const io: Server = req.app.get('io');
      io.to(chat.id).emit('new-message', message);
    }

    res.status(201).json({
      status: 'success',
      data: {
        chat
      }
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { chatId } = req.params;
    const { content, imageUrl }: MessageCreateInput = req.body;

    // Check if chat exists and user is part of it
    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      throw createError('Chat not found', 404);
    }

    if (chat.buyerId !== req.user.id && chat.sellerId !== req.user.id) {
      throw createError('Not authorized to send messages in this chat', 403);
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: req.user.id,
        content,
        imageUrl
      }
    });

    // Update chat updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    // Emit socket event
    const io: Server = req.app.get('io');
    io.to(chatId).emit('new-message', message);

    res.status(201).json({
      status: 'success',
      data: {
        message
      }
    });
  } catch (error) {
    next(error);
  }
};
