import { MessageEvent } from '@line/bot-sdk';
import { lineClient } from '../lineClient';
import { formatAmount } from '../parsers/transactionParser';
import { getCommandHelp } from '../parsers/commandParser';
import { getStartOfMonth, getTodayRange } from '../utils/formatter';
import { createMonthlyReportCard } from '../templates/flex/monthlyReportCard';
import { createDailyReportCard } from '../templates/flex/dailyReportCard';
import { queryQuickReply, mainMenuQuickReply } from '../templates/quickReply';
import prisma from '../../config/database';

/**
 * Handle query commands from LINE user
 * 
 * @param event - LINE message event
 * @param userId - MoneeBunny user ID
 * @param commandType - Type of query command
 */
export async function handleQueryCommand(
  event: MessageEvent,
  userId: string,
  commandType: string
): Promise<void> {
  try {
    switch (commandType) {
      case 'TODAY_EXPENSE':
        await handleTodayExpense(event, userId);
        break;
        
      case 'MONTH_EXPENSE':
        await handleMonthExpense(event, userId);
        break;
        
      case 'STATISTICS':
        await handleStatistics(event, userId);
        break;
        
      case 'HELP':
        await lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: getCommandHelp(),
          quickReply: mainMenuQuickReply,
        });
        break;
        
      default:
        await lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: '❓ 未知指令',
        });
    }
  } catch (error) {
    console.error('Error handling command:', error);
    throw error;
  }
}

/**
 * Handle "今日支出" (today's expenses) command
 * 
 * @param event - LINE message event
 * @param userId - MoneeBunny user ID
 */
async function handleTodayExpense(event: MessageEvent, userId: string): Promise<void> {
  const [today, tomorrow] = getTodayRange();
  
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
    orderBy: {
      amount: 'desc',
    },
  });
  
  if (transactions.length === 0) {
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '📅 今日尚無支出記錄',
      quickReply: mainMenuQuickReply,
    });
    return;
  }
  
  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  
  const transactionItems = transactions.map(t => ({
    category: t.category,
    amount: Number(t.amount),
    description: t.description || ''
  }));
  
  // 使用 Flex Message 月報表卡片
  const flexMessage = createDailyReportCard({
    date: new Date(),
    totalExpense: total,
    transactions: transactionItems,
  });

  await lineClient.replyMessage(event.replyToken, [
    flexMessage,
    {
      type: 'text',
      text: '需要其他報表嗎？',
      quickReply: queryQuickReply,
    },]);
}

/**
 * Handle "本月支出" (this month's expenses) command
 * Groups expenses by category
 * 
 * @param event - LINE message event
 * @param userId - MoneeBunny user ID
 */
async function handleMonthExpense(event: MessageEvent, userId: string): Promise<void> {
  const startOfMonth = getStartOfMonth();
  
  // Group by category
  const categoryStats = await prisma.transaction.groupBy({
    by: ['category'],
    where: {
      userId,
      type: 'EXPENSE',
      date: {
        gte: startOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
  });
  
  if (categoryStats.length === 0) {
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '📊 本月尚無支出記錄',
      quickReply: mainMenuQuickReply,
    });
    return;
  }
  
  const total = categoryStats.reduce((sum, cat) => sum + Number(cat._sum.amount || 0), 0);
  
  // 計算百分比
  const categoriesWithPercentage = categoryStats.map(cat => ({
    category: cat.category,
    amount: Number(cat._sum.amount || 0),
    percentage: Math.round((Number(cat._sum.amount || 0) / total) * 100),
  }));
  
  // 取得收入總計
  const incomeTotal = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'INCOME',
      date: {
        gte: startOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
  });
  
  const month = startOfMonth.getMonth() + 1;
  const year = startOfMonth.getFullYear();
  const totalIncomeValue = Number(incomeTotal._sum.amount || 0);
  const balance = totalIncomeValue - total;
  
  // 使用 Flex Message 月報表卡片
  const flexMessage = createMonthlyReportCard({
    month,
    year,
    totalExpense: total,
    totalIncome: totalIncomeValue,
    balance,
    topCategories: categoriesWithPercentage,
    categories: categoriesWithPercentage,
  });
  
  await lineClient.replyMessage(event.replyToken, [
    flexMessage,
    {
      type: 'text',
      text: '需要其他報表嗎？',
      quickReply: queryQuickReply,
    },
  ]);
}

/**
 * Handle "統計" (statistics) command
 * 
 * @param event - LINE message event
 * @param userId - MoneeBunny user ID
 * @remarks Currently a placeholder, returns available commands
 */
async function handleStatistics(event: MessageEvent, userId: string): Promise<void> {
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: '📊 詳細統計報表功能開發中...\n\n' +
          '目前可使用：\n' +
          '• 今日支出\n' +
          '• 本月支出',
    quickReply: mainMenuQuickReply,
  });
}
