import { z } from 'zod';

/**
 * Schema for creating a transaction
 */
export const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense'], {
    message: 'Type must be either income or expense'
  }),
  date: z.union([
    z.string().datetime(),
    z.date(),
    z.string().transform((str) => new Date(str))
  ]).optional(),
  budgetId: z.string().optional(),
});

/**
 * Schema for updating a transaction
 */
export const updateTransactionSchema = z.object({
  amount: z.number().positive('Amount must be a positive number').optional(),
  description: z.string().min(1, 'Description cannot be empty').optional(),
  category: z.string().min(1, 'Category cannot be empty').optional(),
  type: z.enum(['income', 'expense']).optional(),
  date: z.union([
    z.string().datetime(),
    z.date(),
    z.string().transform((str) => new Date(str))
  ]).optional(),
  budgetId: z.string().nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Export types inferred from schemas
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
