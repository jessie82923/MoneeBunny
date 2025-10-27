import { MessageEvent } from '@line/bot-sdk';
import { lineClient } from '../lineClient';
import { formatAmount } from '../parsers/transactionParser';
import { getStartOfMonth } from '../utils/formatter';
import { createTransactionCard } from '../templates/flex/transactionCard';
import { mainMenuQuickReply } from '../templates/quickReply';
import prisma from '../../config/database';
import TransactionService from '../../services/transactionService';
import type { ParsedTransaction } from '../types';

/**
 * Handle transaction recording from LINE user message
 * 
 * @param event - LINE message event
 * @param userId - MoneeBunny user ID
 * @param parsed - Parsed transaction data
 * @remarks Creates transaction and calculates monthly category total
 */
export async function handleTransactionRecord(
  event: MessageEvent,
  userId: string,
  parsed: ParsedTransaction
): Promise<void> {
  try {
    // Create transaction record
    const transaction = await TransactionService.createTransaction({
      user: {
        connect: { id: userId },
      },
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category || 'Other',
      description: parsed.description || '',
      date: new Date(),
    });
    
    // Calculate monthly total for this category
    const startOfMonth = getStartOfMonth();
    
    const monthlyTotal = await prisma.transaction.aggregate({
      where: {
        userId,
        category: transaction.category,
        type: 'EXPENSE',
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });
    
    const totalAmount = monthlyTotal._sum.amount || 0;
    
    // 使用 Flex Message 卡片回覆
    const flexMessage = createTransactionCard({
      id: transaction.id,
      type: parsed.type as 'INCOME' | 'EXPENSE',
      amount: Number(transaction.amount),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      monthlyTotal: Number(totalAmount),
    });

    await lineClient.replyMessage(event.replyToken, [
      flexMessage,
      {
        type: 'text',
        text: '還想做什麼呢？',
        quickReply: mainMenuQuickReply,
      },
    ]);
    
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}
