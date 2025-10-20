/**
 * Jest Setup File
 * Runs before all tests
 */

import prisma from '../src/config/database';

// Set environment to test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://monee:moneePWD@localhost:5432/moneebunny_test';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.console = {
  ...console,
  // Suppress logs during tests (optional)
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
  // info: jest.fn(),
  // debug: jest.fn(),
};

// Close database connection after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
