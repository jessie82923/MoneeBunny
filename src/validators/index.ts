/**
 * Validators Index
 * Export all validation schemas and the validate middleware
 */

// Middleware
export { validate, validateQuery, validateParams } from '../middleware/validate';

// Auth schemas
export {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  type RegisterInput,
  type LoginInput,
  type UpdateProfileInput,
} from './authSchemas';

// Transaction schemas
export {
  createTransactionSchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from './transactionSchemas';

// Re-export all types for convenience
export type {
  UserWithRelations,
  TransactionWithRelations,
  ApiResponse,
  AuthTokenPayload,
} from './types';

