import { Router } from 'express';
import transactionController from '../controllers/transactionController';

const router = Router();

// Route to add a new transaction
router.post('/', transactionController.addTransaction.bind(transactionController));

// Route to update an existing transaction
router.put('/:id', transactionController.updateTransaction.bind(transactionController));

// Route to retrieve all transactions
router.get('/', transactionController.getAllTransactions.bind(transactionController));

// Route to retrieve a specific transaction by ID
router.get('/:id', transactionController.getTransaction.bind(transactionController));

export default router;