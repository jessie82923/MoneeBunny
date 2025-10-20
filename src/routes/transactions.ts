import { Router } from 'express';
import transactionController from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';
import { validate, createTransactionSchema, updateTransactionSchema } from '../validators';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

// Route to add a new transaction
router.post('/', validate(createTransactionSchema), transactionController.addTransaction.bind(transactionController));

// Route to update an existing transaction
router.put('/:id', validate(updateTransactionSchema), transactionController.updateTransaction.bind(transactionController));

// Route to retrieve all transactions
router.get('/', transactionController.getAllTransactions.bind(transactionController));

// Route to retrieve a specific transaction by ID
router.get('/:id', transactionController.getTransaction.bind(transactionController));

// Route to delete a transaction
router.delete('/:id', transactionController.deleteTransaction.bind(transactionController));

export default router;