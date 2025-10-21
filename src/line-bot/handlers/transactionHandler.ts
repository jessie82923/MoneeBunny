import { MessageEvent } from '@line/bot-sdk';
import { lineClient } from '../lineClient';
import { formatAmount } from '../parsers/transactionParser';
import { getStartOfMonth } from '../utils/formatter';
import prisma from '../../config/database';
import TransactionService from '../../services/transactionService';

/**
 * Parsed transaction data from user message
 */
interface ParsedTransaction {
  type: string;
  amount: number;
  category?: string;
  description?: string;
}

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
    
    // Format reply message
    const emoji = parsed.type === 'INCOME' ? '💰' : '💸';
    const typeText = parsed.type === 'INCOME' ? '收入' : '支出';
    
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: `${emoji} 已記錄${typeText}\n\n` +
            `📝 ${transaction.description || transaction.category}\n` +
            `💵 ${formatAmount(Number(transaction.amount))}\n` +
            `📁 分類: ${transaction.category}\n` +
            `📅 日期: ${transaction.date.toLocaleDateString('zh-TW')}\n\n` +
            `📊 本月「${transaction.category}」${typeText}: ${formatAmount(Number(totalAmount))}`,
    });
    
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}
