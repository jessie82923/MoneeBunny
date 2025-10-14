import type { User, Budget, Transaction } from '@prisma/client';

// 擴展 Prisma 生成的類型
export type UserWithRelations = User & {
  budgets?: Budget[];
  transactions?: Transaction[];
};

export type BudgetWithRelations = Budget & {
  user?: User;
  transactions?: Transaction[];
};

export type TransactionWithRelations = Transaction & {
  user?: User;
  budget?: Budget;
};

// 建立和更新的類型
export type CreateUserInput = Pick<User, 'email' | 'password' | 'firstName' | 'lastName'>;
export type UpdateUserInput = Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>;

export type CreateBudgetInput = Pick<Budget, 'name' | 'amount' | 'period' | 'startDate' | 'endDate'>;
export type UpdateBudgetInput = Partial<CreateBudgetInput>;

export type CreateTransactionInput = Pick<Transaction, 'amount' | 'description' | 'category' | 'type' | 'date' | 'budgetId'>;
export type UpdateTransactionInput = Partial<CreateTransactionInput>;

// API 回應類型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 認證相關
export interface AuthTokenPayload {
  userId: string;
  email: string;
}