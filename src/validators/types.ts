/**
 * Common Types
 * Export shared types used across the application
 */

// Re-export types from validators
export type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from './authSchemas';

export type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from './transactionSchemas';

// Re-export Prisma relation types, classes import types can only do once in here
export type {
  UserWithRelations,
  TransactionWithRelations,
  ApiResponse,
  AuthTokenPayload,
} from '../types';
