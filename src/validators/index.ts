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

// Budget schemas
export {
  createBudgetSchema,
  updateBudgetSchema,
  type CreateBudgetInput,
  type UpdateBudgetInput,
} from './budgetSchemas';

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
  BudgetWithRelations,
  TransactionWithRelations,
  ApiResponse,
  AuthTokenPayload,
} from './types';

