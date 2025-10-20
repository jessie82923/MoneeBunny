import { z } from 'zod';

/**
 * Schema for creating a budget
 */
export const createBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  amount: z.number().positive('Amount must be a positive number'),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    message: 'Period must be one of: daily, weekly, monthly, yearly'
  }),
  startDate: z.union([
    z.string().datetime(),
    z.date(),
    z.string().transform((str) => new Date(str))
  ]),
  endDate: z.union([
    z.string().datetime(),
    z.date(),
    z.string().transform((str) => new Date(str)),
    z.null()
  ]).optional(),
});

/**
 * Schema for updating a budget
 */
export const updateBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name cannot be empty').optional(),
  amount: z.number().positive('Amount must be a positive number').optional(),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  startDate: z.union([
    z.string().datetime(),
    z.date(),
    z.string().transform((str) => new Date(str))
  ]).optional(),
  endDate: z.union([
    z.string().datetime(),
    z.date(),
    z.string().transform((str) => new Date(str)),
    z.null()
  ]).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Export types inferred from schemas
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
