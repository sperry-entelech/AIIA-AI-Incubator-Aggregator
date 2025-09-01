import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// Import routes
import authRoutes from './routes/auth';
import communityRoutes from './routes/communities';
import memberRoutes from './routes/members';
import subscriptionRoutes from './routes/subscriptions';
import analyticsRoutes from './routes/analytics';
import webhookRoutes from './routes/webhooks';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { authMiddleware } from './middleware/auth';

// Import services
import { DiscordBot } from './discord/bot';
import logger from './utils/logger';

class CommunityOSServer {
  private app: express.Application;
  private prisma: PrismaClient;
  private redis: Redis;
  private discordBot: DiscordBot;
  
  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.discordBot = new DiscordBot();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }
  
  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    }));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Request logging
    this.app.use(requestLogger);
    
    // Add Prisma and Redis to request context
    this.app.use((req, res, next) => {
      req.prisma = this.prisma;
      req.redis = this.redis;
      req.discordBot = this.discordBot;
      next();
    });
  }
  
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      });
    });
    
    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/communities', authMiddleware, communityRoutes);
    this.app.use('/api/v1/members', authMiddleware, memberRoutes);
    this.app.use('/api/v1/subscriptions', authMiddleware, subscriptionRoutes);
    this.app.use('/api/v1/analytics', authMiddleware, analyticsRoutes);
    
    // Webhook routes (no auth required)
    this.app.use('/webhooks', webhookRoutes);
    
    // API documentation
    if (process.env.NODE_ENV !== 'production') {
      const swaggerUi = require('swagger-ui-express');
      const swaggerDocument = require('../docs/swagger.json');
      
      this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }
    
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.originalUrl} not found`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
        },
      });
    });
  }
  
  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }
  
  public async start(): Promise<void> {
    try {
      // Test database connection
      await this.prisma.$connect();
      logger.info('Database connected successfully');
      
      // Test Redis connection
      await this.redis.ping();
      logger.info('Redis connected successfully');
      
      // Initialize Discord bot
      await this.discordBot.start();
      logger.info('Discord bot started successfully');
      
      // Start HTTP server
      const port = process.env.PORT || 8000;
      this.app.listen(port, () => {
        logger.info(`CommunityOS API server running on port ${port}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`API Documentation: http://localhost:${port}/docs`);
      });
      
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
  
  public async shutdown(): Promise<void> {
    logger.info('Shutting down server...');
    
    try {
      await this.discordBot.stop();
      await this.prisma.$disconnect();
      await this.redis.quit();
      
      logger.info('Server shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await server.shutdown();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await server.shutdown();
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
const server = new CommunityOSServer();
server.start();

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
      redis: Redis;
      discordBot: DiscordBot;
      user?: any;
      community?: any;
      id: string;
    }
  }
}

export default server;