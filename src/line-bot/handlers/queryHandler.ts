import { MessageEvent } from '@line/bot-sdk';
import { lineClient } from '../lineClient';
import { formatAmount } from '../parsers/transactionParser';
import { getCommandHelp } from '../parsers/commandParser';
import { getCategoryEmoji, getStartOfMonth, getTodayRange, getBudgetStatusEmoji } from '../utils/formatter';
import prisma from '../../config/database';
import BudgetService from '../../services/budgetService';

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
        
      case 'MONTH_BUDGET':
        await handleMonthBudget(event, userId);
        break;
        
      case 'STATISTICS':
        await handleStatistics(event, userId);
        break;
        
      case 'HELP':
        await lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: getCommandHelp(),
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
      date: 'desc',
    },
  });
  
  if (transactions.length === 0) {
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '📅 今日尚無支出記錄',
    });
    return;
  }
  
  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  
  const details = transactions
    .map(t => `• ${t.description || t.category}: ${formatAmount(Number(t.amount))}`)
    .join('\n');
  
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `📅 今日支出報表\n\n` +
          `${details}\n\n` +
          `────────────────\n` +
          `💰 總計: ${formatAmount(total)}`,
  });
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
    });
    return;
  }
  
  const total = categoryStats.reduce((sum, cat) => sum + Number(cat._sum.amount || 0), 0);
  
  const details = categoryStats
    .map(cat => {
      const emoji = getCategoryEmoji(cat.category);
      return `${emoji} ${cat.category}: ${formatAmount(Number(cat._sum.amount || 0))}`;
    })
    .join('\n');
  
  const month = startOfMonth.getMonth() + 1;
  
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `📊 本月支出報表 (${month}月)\n\n` +
          `${details}\n\n` +
          `────────────────\n` +
          `💰 總計: ${formatAmount(total)}`,
  });
}

/**
 * Handle "本月預算" (this month's budget) command
 * Shows budget status with spent/remaining amounts
 * 
 * @param event - LINE message event
 * @param userId - MoneeBunny user ID
 */
async function handleMonthBudget(event: MessageEvent, userId: string): Promise<void> {
  const budgets = await BudgetService.getBudgetsByUserId(userId);
  
  if (budgets.length === 0) {
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '📋 尚未設定預算\n\n請先在網頁版建立預算規劃',
    });
    return;
  }
  
  const startOfMonth = getStartOfMonth();
  
  const details = await Promise.all(
    budgets.map(async (budget: any) => {
      const spent = await prisma.transaction.aggregate({
        where: {
          userId,
          budgetId: budget.id,
          type: 'EXPENSE',
          date: {
            gte: startOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      });
      
      const spentAmount = Number(spent._sum.amount || 0);
      const budgetAmount = Number(budget.amount);
      const remaining = budgetAmount - spentAmount;
      const percentage = Math.round((spentAmount / budgetAmount) * 100);
      
      const status = getBudgetStatusEmoji(spentAmount, budgetAmount);
      
      return `${status} ${budget.name}\n` +
             `   已用: ${formatAmount(spentAmount)} / ${formatAmount(budgetAmount)}\n` +
             `   剩餘: ${formatAmount(remaining)} (${percentage}%)`;
    })
  );
  
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `📋 本月預算執行狀況\n\n${details.join('\n\n')}`,
  });
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
          '• 本月支出\n' +
          '• 本月預算',
  });
}
