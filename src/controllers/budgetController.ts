import { Request, Response } from 'express';
import BudgetService from '../services/budgetService';

class BudgetController {
    async createBudget(req: Request, res: Response): Promise<void> {
        try {
            const budgetData = req.body;
            const newBudget = await BudgetService.createBudget(budgetData);
            res.status(201).json(newBudget);
        } catch (error) {
            res.status(500).json({ message: 'Error creating budget', error });
        }
    }

    async updateBudget(req: Request, res: Response): Promise<void> {
        try {
            const budgetId = req.params.id;
            const budgetData = req.body;
            const updatedBudget = await BudgetService.updateBudget(budgetId, budgetData);
            if (updatedBudget) {
                res.status(200).json(updatedBudget);
            } else {
                res.status(404).json({ message: 'Budget not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating budget', error });
        }
    }

    async getBudget(req: Request, res: Response): Promise<void> {
        try {
            const budgetId = req.params.id;
            const budget = await BudgetService.getBudgetById(budgetId);
            if (budget) {
                res.status(200).json(budget);
            } else {
                res.status(404).json({ message: 'Budget not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving budget', error });
        }
    }

    async deleteBudget(req: Request, res: Response): Promise<void> {
        try {
            const budgetId = req.params.id;
            const deletedBudget = await BudgetService.deleteBudget(budgetId);
            if (deletedBudget) {
                res.status(200).json({ message: 'Budget deleted successfully', budget: deletedBudget });
            } else {
                res.status(404).json({ message: 'Budget not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error deleting budget', error });
        }
    }

    async getAllBudgets(req: Request, res: Response): Promise<void> {
        try {
            const budgets = await BudgetService.getAllBudgets();
            res.status(200).json(budgets);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving budgets', error });
        }
    }
}

export default new BudgetController();