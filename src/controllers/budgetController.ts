/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import BudgetService from '../services/budgetService';
import type { ApiResponse } from '../types';

class BudgetController {
    /**
     * Create a new budget.
     * @param req - Express request with budget data in body
     * @param res - Express response
     */
    async createBudget(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                } satisfies ApiResponse);
            }

            const { name, amount, period, startDate, endDate } = req.body;

            const newBudget = await BudgetService.createBudget({
                name,
                amount,
                period,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                user: {
                    connect: { id: userId }
                }
            });

            return res.status(201).json({
                success: true,
                data: newBudget,
                message: 'Budget created successfully',
            } satisfies ApiResponse);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error creating budget';

            return res.status(500).json({
                success: false,
                error: errorMessage,
            } satisfies ApiResponse);
        }
    }

    /**
     * Update an existing budget.
     * @param req - Express request with budget ID and update data
     * @param res - Express response
     */
    async updateBudget(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.userId;
            const budgetId = req.params.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                } satisfies ApiResponse);
            }

            // Check if budget exists and belongs to user
            const existingBudget = await BudgetService.getBudgetById(budgetId);
            if (!existingBudget) {
                return res.status(404).json({
                    success: false,
                    error: 'Budget not found',
                } satisfies ApiResponse);
            }

            if (existingBudget.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: You can only update your own budgets',
                } satisfies ApiResponse);
            }

            const { name, amount, period, startDate, endDate } = req.body;

            const updatedBudget = await BudgetService.updateBudget(budgetId, {
                ...(name && { name }),
                ...(amount && { amount }),
                ...(period && { period }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
            });

            return res.status(200).json({
                success: true,
                data: updatedBudget,
                message: 'Budget updated successfully',
            } satisfies ApiResponse);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error updating budget';

            return res.status(500).json({
                success: false,
                error: errorMessage,
            } satisfies ApiResponse);
        }
    }

    /**
     * Get a specific budget.
     * @param req - Express request with budget ID in params
     * @param res - Express response
     */
    async getBudget(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.userId;
            const budgetId = req.params.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                } satisfies ApiResponse);
            }

            const budget = await BudgetService.getBudgetById(budgetId);

            if (!budget) {
                return res.status(404).json({
                    success: false,
                    error: 'Budget not found',
                } satisfies ApiResponse);
            }

            if (budget.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: You can only view your own budgets',
                } satisfies ApiResponse);
            }

            return res.status(200).json({
                success: true,
                data: budget,
            } satisfies ApiResponse);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error retrieving budget';

            return res.status(500).json({
                success: false,
                error: errorMessage,
            } satisfies ApiResponse);
        }
    }

    /**
     * Delete a budget.
     * @param req - Express request with budget ID in params
     * @param res - Express response
     */
    async deleteBudget(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.userId;
            const budgetId = req.params.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                } satisfies ApiResponse);
            }

            // Check if budget exists and belongs to user
            const existingBudget = await BudgetService.getBudgetById(budgetId);
            if (!existingBudget) {
                return res.status(404).json({
                    success: false,
                    error: 'Budget not found',
                } satisfies ApiResponse);
            }

            if (existingBudget.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: You can only delete your own budgets',
                } satisfies ApiResponse);
            }

            await BudgetService.deleteBudget(budgetId);

            return res.status(200).json({
                success: true,
                message: 'Budget deleted successfully',
            } satisfies ApiResponse);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error deleting budget';

            return res.status(500).json({
                success: false,
                error: errorMessage,
            } satisfies ApiResponse);
        }
    }

    /**
     * Get all budgets for the current user.
     * @param req - Express request with userId from auth middleware
     * @param res - Express response
     */
    async getAllBudgets(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                } satisfies ApiResponse);
            }

            const budgets = await BudgetService.getBudgetsByUserId(userId);

            return res.status(200).json({
                success: true,
                data: budgets,
            } satisfies ApiResponse);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error retrieving budgets';

            return res.status(500).json({
                success: false,
                error: errorMessage,
            } satisfies ApiResponse);
        }
    }
}

export default new BudgetController();