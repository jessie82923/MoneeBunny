import prisma from '../config/database';
import { Budget, Prisma } from '@prisma/client';

class BudgetService {
    async createBudget(budgetData: Prisma.BudgetCreateInput): Promise<Budget> {
        return await prisma.budget.create({
            data: budgetData
        });
    }

    async getBudgetById(budgetId: string): Promise<Budget | null> {
        return await prisma.budget.findUnique({
            where: { id: budgetId }
        });
    }

    async updateBudget(budgetId: string, budgetData: Prisma.BudgetUpdateInput): Promise<Budget | null> {
        return await prisma.budget.update({
            where: { id: budgetId },
            data: budgetData
        });
    }

    async deleteBudget(budgetId: string): Promise<Budget | null> {
        return await prisma.budget.delete({
            where: { id: budgetId }
        });
    }

    async getAllBudgets(): Promise<Budget[]> {
        return await prisma.budget.findMany();
    }
}

export default new BudgetService();