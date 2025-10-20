/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import TransactionService from '../services/transactionService';
import type { ApiResponse } from '../types';

class TransactionController {
    /**
     * Add a new transaction.
     * @param req - Express request with transaction data in body
     * @param res - Express response
     */
    async addTransaction(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                } satisfies ApiResponse);
            }

            const { amount, description, category, type, date, budgetId } = req.body;

            const newTransaction = await TransactionService.createTransaction({
                amount,
                description,
                category,
                type,
                date: date ? new Date(date) : new Date(),
                user: {
                    connect: { id: userId }
                },
                ...(budgetId && {
                    budget: {
                        connect: { id: budgetId }
                    }
                })
            });

            return res.status(201).json({
                success: true,
                data: newTransaction,
                message: 'Transaction added successfully',
            } satisfies ApiResponse);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error adding transaction';

            return res.status(500).json({
                success: false,
                error: errorMessage,
            } satisfies ApiResponse);
        }
    }

    /**
     * Update an existing transaction.
     * @param req - Express request with transaction ID and update data
     * @param res - Express response
     */
    async updateTransaction(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.userId;
            const transactionId = req.params.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                } satisfies ApiResponse);
            }

            // Check if transaction exists and belongs to user
            const existingTransaction = await TransactionService.getTransactionById(transactionId);
            if (!existingTransaction) {
                return res.status(404).json({
                    success: false,
                    error: 'Transaction not found',
                } satisfies ApiResponse);
            }

            if (existingTransaction.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: You can only update your own transactions',
                } satisfies ApiResponse);
            }

            const { amount, description, category, type, date, budgetId } = req.body;

            const updatedTransaction = await TransactionService.updateTransaction(transactionId, {
                ...(amount && { amount }),
                ...(description && { description }),
                ...(category && { category }),
                ...(type && { type }),
                ...(date && { date: new Date(date) }),
                ...(budgetId && {
                    budget: {
                        connect: { id: budgetId }
                    }
                })
            });

            return res.status(200).json({
                success: true,
                data: updatedTransaction,
                message: 'Transaction updated successfully',
            } satisfies ApiResponse);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error updating transaction';

            return res.status(500).json({
                success: false,
                error: errorMessage,
            } satisfies ApiResponse);
        }
    }

    /**
     * Retrieve a specific transaction.
     * @param req - Express request with transaction ID in params
     * @param res - Express response
     */
    async getTransaction(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.userId;
            const transactionId = req.params.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                } satisfies ApiResponse);
            }

            const transaction = await TransactionService.getTransactionById(transactionId);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    error: 'Transaction not found',
                } satisfies ApiResponse);
            }

            if (transaction.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: You can only view your own transactions',
                } satisfies ApiResponse);
            }

            return res.status(200).json({
                success: true,
                data: transaction,
            } satisfies ApiResponse);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error fetching transaction';

            return res.status(500).json({
                success: false,
                error: errorMessage,
            } satisfies ApiResponse);
        }
    }

    /**
     * Retrieve all transactions for the current user.
     * @param req - Express request with userId from auth middleware
     * @param res - Express response
     */
    async getAllTransactions(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                } satisfies ApiResponse);
            }

            const transactions = await TransactionService.getTransactionsByUserId(userId);

            return res.status(200).json({
                success: true,
                data: transactions,
            } satisfies ApiResponse);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error fetching transactions';

            return res.status(500).json({
                success: false,
                error: errorMessage,
            } satisfies ApiResponse);
        }
    }

    /**
     * Delete a transaction.
     * @param req - Express request with transaction ID in params
     * @param res - Express response
     */
    async deleteTransaction(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.userId;
            const transactionId = req.params.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                } satisfies ApiResponse);
            }

            // Check if transaction exists and belongs to user
            const existingTransaction = await TransactionService.getTransactionById(transactionId);
            if (!existingTransaction) {
                return res.status(404).json({
                    success: false,
                    error: 'Transaction not found',
                } satisfies ApiResponse);
            }

            if (existingTransaction.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: You can only delete your own transactions',
                } satisfies ApiResponse);
            }

            await TransactionService.deleteTransaction(transactionId);

            return res.status(200).json({
                success: true,
                message: 'Transaction deleted successfully',
            } satisfies ApiResponse);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error deleting transaction';

            return res.status(500).json({
                success: false,
                error: errorMessage,
            } satisfies ApiResponse);
        }
    }
}

export default new TransactionController();