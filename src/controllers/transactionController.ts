import { Request, Response } from 'express';

class TransactionController {
    async addTransaction(req: Request, res: Response): Promise<void> {
        // Logic to add a new transaction
    }

    async updateTransaction(req: Request, res: Response): Promise<void> {
        // Logic to update an existing transaction
    }

    async getTransaction(req: Request, res: Response): Promise<void> {
        // Logic to retrieve a specific transaction
    }

    async getAllTransactions(req: Request, res: Response): Promise<void> {
        // Logic to retrieve all transactions
    }
}

export default new TransactionController();