import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import chatRoutes from './routes/chat.routes';
import favoriteRoutes from './routes/favorite.routes';
import reviewRoutes from './routes/review.routes';
import userRoutes from './routes/user.routes';
import uploadRoutes from './routes/upload.routes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BitBazaar API is running' });
});

// Error handling middleware
app.use(errorHandler);

httpServer.listen(PORT, async () => {
  console.log(`🚀 BitBazaar API server running on port ${PORT}`);
  
  // Seed sample data on startup (non-blocking)
  seedData().catch((err) => {
    console.error('❌ Error seeding data:', err);
  });

  // Run expiration cleanup on startup (non-blocking, don't fail server startup)
  cleanupExpiredListings().catch((err) => {
    console.error('❌ Error running expiration cleanup:', err);
  });
  
  // Schedule cleanup - more frequently in development for testing
  const scheduleCleanup = () => {
    if (process.env.NODE_ENV === 'development') {
      // In development: Run every minute for testing
      setInterval(() => {
        cleanupExpiredListings().catch((err) => {
          console.error('❌ Error in scheduled cleanup:', err);
        });
      }, 60 * 1000); // Every minute
      console.log('📅 Expiration cleanup scheduled (runs every minute in development)');
    } else {
      // In production: Run daily at midnight
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const msUntilMidnight = midnight.getTime() - now.getTime();

      setTimeout(() => {
        cleanupExpiredListings().catch((err) => {
          console.error('❌ Error in scheduled cleanup:', err);
        });
        // Run every 24 hours after first run
        setInterval(() => {
          cleanupExpiredListings().catch((err) => {
            console.error('❌ Error in scheduled cleanup:', err);
          });
        }, 24 * 60 * 60 * 1000);
      }, msUntilMidnight);
      console.log('📅 Expiration cleanup scheduled (runs daily at midnight)');
    }
  };

  scheduleCleanup();
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  TESTING MODE: Expiration set to 3 minutes (expires) / 5 minutes (deletes)');
    console.log('⚠️  Cleanup runs every minute for testing');
  }
});

export { io };

