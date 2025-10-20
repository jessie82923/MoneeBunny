import { Router } from 'express';
import budgetController from '../controllers/budgetController';
import { authenticate } from '../middleware/auth';
import { validate, createBudgetSchema, updateBudgetSchema } from '../validators';

const router = Router();

// All budget routes require authentication
router.use(authenticate);

// Route to create a new budget
router.post('/', validate(createBudgetSchema), budgetController.createBudget.bind(budgetController));

// Route to get all budgets
router.get('/', budgetController.getAllBudgets.bind(budgetController));

// Route to get a specific budget by ID
router.get('/:id', budgetController.getBudget.bind(budgetController));

// Route to update a budget by ID
router.put('/:id', validate(updateBudgetSchema), budgetController.updateBudget.bind(budgetController));

// Route to delete a budget by ID
router.delete('/:id', budgetController.deleteBudget.bind(budgetController));

export default router;