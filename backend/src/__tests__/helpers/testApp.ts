import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import compression from 'compression';

// Routes
import authRoutes from '../../routes/auth.routes';
import listingRoutes from '../../routes/listing.routes';
import chatRoutes from '../../routes/chat.routes';
import favoriteRoutes from '../../routes/favorite.routes';
import reviewRoutes from '../../routes/review.routes';
import userRoutes from '../../routes/user.routes';
import uploadRoutes from '../../routes/upload.routes';
import categoryRoutes from '../../routes/category.routes';

// Middleware
import { errorHandler } from '../../middleware/errorHandler';

export function createTestApp() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  }));

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Make io accessible to routes
  app.set('io', io);

  // Routes (without rate limiters in tests)
  app.use('/api/auth', authRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/upload', uploadRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'BitBazaar API is running',
      timestamp: new Date().toISOString(),
      environment: 'test',
    });
  });

  // Error handling middleware
  app.use(errorHandler);

  return { app, httpServer, io };
}
