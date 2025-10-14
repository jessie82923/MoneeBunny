import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma client instance
 * Configured with appropriate logging based on environment
 */
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

/**
 * Gracefully disconnect from database on process exit
 */
const gracefulShutdown = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);

export default prisma;