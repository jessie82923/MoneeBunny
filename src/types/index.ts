import type { User, Transaction } from '@prisma/client';

// 擴展 Prisma 生成的類型
export type UserWithRelations = User & {
  transactions?: Transaction[];
};

export type TransactionWithRelations = Transaction & {
  user?: User;
};

// API 回應類型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>; // For validation errors
}

// 認證相關
export interface AuthTokenPayload {
  userId: string;
  email: string;
}

// Note: CreateInput 和 UpdateInput 型別已移至 validators 資料夾
// 請從 validators 匯入，例如：
// import type { RegisterInput, CreateTransactionInput } from '../validators';
