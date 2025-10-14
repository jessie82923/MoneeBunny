import { Router } from 'express';
import budgetController from '../controllers/budgetController';

const router = Router();

// Route to create a new budget
router.post('/', budgetController.createBudget.bind(budgetController));

// Route to get all budgets
router.get('/', budgetController.getAllBudgets.bind(budgetController));

// Route to get a specific budget by ID
router.get('/:id', budgetController.getBudget.bind(budgetController));

// Route to update a budget by ID
router.put('/:id', budgetController.updateBudget.bind(budgetController));

// Route to delete a budget by ID
router.delete('/:id', budgetController.deleteBudget.bind(budgetController));

export default router;