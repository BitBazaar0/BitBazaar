import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import compression from 'compression';

// Routes
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import chatRoutes from './routes/chat.routes';
import favoriteRoutes from './routes/favorite.routes';
import reviewRoutes from './routes/review.routes';
import userRoutes from './routes/user.routes';
import uploadRoutes from './routes/upload.routes';
import categoryRoutes from './routes/category.routes';
import emailTestRoutes from './routes/email-test.routes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter, uploadLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';
import { seedData } from './utils/seed-db';
import { cleanupExpiredListings } from './utils/expiration-cleanup';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Security middleware - must be first
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false, // Allow Socket.IO to work
}));

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  logger.debug(`Socket connection: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    logger.debug(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    logger.debug(`Socket ${socket.id} left room ${roomId}`);
  });

  socket.on('disconnect', () => {
    logger.debug(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes with specific rate limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
app.use('/api', emailTestRoutes); // Email test route (dev only)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BitBazaar API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Error handling middleware
app.use(errorHandler);

httpServer.listen(PORT, async () => {
  logger.info(`BitBazaar API server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  
  // Seed sample data on startup (non-blocking)
  seedData().catch((err) => {
    logger.error('Error seeding data:', err);
  });

  // Run expiration cleanup on startup (non-blocking)
  cleanupExpiredListings().catch((err) => {
    logger.error('Error running expiration cleanup:', err);
  });
  
  // Schedule cleanup
  const scheduleCleanup = () => {
    if (process.env.NODE_ENV === 'development') {
      // In development: Run every minute for testing
      setInterval(() => {
        cleanupExpiredListings().catch((err) => {
          logger.error('Error in scheduled cleanup:', err);
        });
      }, 60 * 1000);
      logger.info('Expiration cleanup scheduled (runs every minute in development)');
    } else {
      // In production: Run daily at midnight
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const msUntilMidnight = midnight.getTime() - now.getTime();

      setTimeout(() => {
        cleanupExpiredListings().catch((err) => {
          logger.error('Error in scheduled cleanup:', err);
        });
        // Run every 24 hours after first run
        setInterval(() => {
          cleanupExpiredListings().catch((err) => {
            logger.error('Error in scheduled cleanup:', err);
          });
        }, 24 * 60 * 60 * 1000);
      }, msUntilMidnight);
      logger.info('Expiration cleanup scheduled (runs daily at midnight)');
    }
  };

  scheduleCleanup();
  
  if (process.env.NODE_ENV === 'development') {
    logger.warn('TESTING MODE: Expiration set to 3 minutes (expires) / 5 minutes (deletes)');
  }
});

export { io };

