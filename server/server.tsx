import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.ts';
import transactionRoutes from './routes/transactions.ts';
import aiRoutes from './routes/ai.ts';

// Load environment variables
dotenv.config();

/**
 * MAIN SERVER FILE
 * Sets up Express server, MongoDB connection, middleware, and routes
 */

// Initialize Express app
const app: Application = express();

// Configuration
const PORT: number = parseInt(process.env.PORT || '5000', 10);
const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-finance';

/**
 * MIDDLEWARE
 * Configure Express to handle JSON, CORS, and logging
 */

// Parse JSON request bodies
app.use(express.json());

// Enable CORS for frontend communication
app.use(
  cors({
    origin: 'https://ai-finance-visualizer.onrender.com', // Vite default port
    credentials: true
  })
);

// Simple request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

/**
 * ROUTES
 * Mount API route handlers
 */
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/**
 * DATABASE CONNECTION
 * Connect to MongoDB using Mongoose
 */
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ MongoDB connection error:', message);
    process.exit(1); // Exit if database connection fails
  }
};

/**
 * START SERVER
 * Connect to database and start listening for requests
 */
const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
  });
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: unknown) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
