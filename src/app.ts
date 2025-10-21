import express from 'express';
import bodyParser from 'body-parser';
import prisma from './config/database';
import authRoutes from './routes/auth';
import budgetRoutes from './routes/budgets';
import transactionRoutes from './routes/transactions';
import userRoutes from './routes/users';
import lineRoutes from './routes/line';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debug middleware - Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// Database connection test
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err: Error) => console.error('Database connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/line', lineRoutes);

// Export app for testing
export { app };

// Start the server (only if not in test mode)
const server = process.env.NODE_ENV !== 'test' 
  ? app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    })
  : null;


/**
 * Gracefully shutdown the application.
 * Closes HTTP server and disconnects database in order.
 * 
 * @param signal - The shutdown signal received (SIGINT, SIGTERM, etc.)
 * @remarks Ensures all resources are cleaned up before process exit
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  // Close HTTP server first (stop accepting new connections)
  if (server) {
    server.close(async (err) => {
      if (err) {
        console.error('Error closing HTTP server:', err);
        process.exit(1);
        return;
      }
      
      console.log('HTTP server closed.');
      
      // Disconnect database
      try {
        await prisma.$disconnect();
        console.log('Database disconnected.');
        process.exit(0);
      } catch (error) {
        console.error('Error disconnecting database:', error);
        process.exit(1);
      }
    });
    
    // Timeout fallback: force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Shutdown timeout exceeded. Forcing exit...');
      process.exit(1);
    }, 10000);
  } else {
    // If no server (test mode), just disconnect database
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Handle shutdown signals (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});
