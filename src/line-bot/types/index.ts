/**
 * LINE Bot Domain Types
 * 
 * @remarks
 * Centralized type definitions for LINE Bot handlers and services.
 * Following TypeScript 5.x best practices for shared contracts.
 */

/**
 * Parsed transaction data from user message
 * 
 * @remarks
 * Used by transactionParser to communicate with transactionHandler
 */
export interface ParsedTransaction {
  type: string;
  amount: number;
  category?: string;
  description?: string;
}

/**
 * Transaction data for Flex Message card display
 * 
 * @remarks
 * Extended with monthly statistics for rich card rendering
 */
export interface TransactionCardData {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: Date;
  monthlyTotal?: number;
}

/**
 * Daily report transaction item
 */
export interface DailyTransactionItem {
  category: string;
  amount: number;
  description?: string;
}

/**
 * Daily report data structure
 */
export interface DailyReportData {
  date: Date;
  totalExpense: number;
  transactions: DailyTransactionItem[];
}

/**
 * Monthly report data structure
 */
export interface MonthlyReportData {
  month: number;
  year: number;
  totalExpense: number;
  totalIncome: number;
  balance: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  categories: CategoryStat[];
  compareLastMonth?: {
    percentage: number;
    trend: 'up' | 'down';
  };
}

/**
 * Category statistics for reports
 */
export interface CategoryStat {
  category: string;
  amount: number;
  percentage: number;
}
