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


export default prisma;