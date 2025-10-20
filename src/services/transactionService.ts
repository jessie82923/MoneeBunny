import prisma from '../config/database';
import { Transaction, Prisma } from '@prisma/client';

export class TransactionService {
    async createTransaction(data: Prisma.TransactionCreateInput): Promise<Transaction> {
        return await prisma.transaction.create({
            data
        });
    }

    async getTransactionById(id: string): Promise<Transaction | null> {
        return await prisma.transaction.findUnique({
            where: { id }
        });
    }

    async updateTransaction(id: string, data: Prisma.TransactionUpdateInput): Promise<Transaction | null> {
        return await prisma.transaction.update({
            where: { id },
            data
        });
    }

    async deleteTransaction(id: string): Promise<Transaction | null> {
        return await prisma.transaction.delete({
            where: { id }
        });
    }

    async getAllTransactions(): Promise<Transaction[]> {
        return await prisma.transaction.findMany();
    }

    async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
        return await prisma.transaction.findMany({
            where: { userId },
            include: {
                budget: true
            },
            orderBy: {
                date: 'desc'
            }
        });
    }
}

export default new TransactionService();