import { MessageEvent, TextMessage } from '@line/bot-sdk';
import { lineClient } from '../lineClient';
import { parseTransactionMessage, formatAmount } from '../parsers/transactionParser';
import { parseCommand, getCommandHelp } from '../parsers/commandParser';
import prisma from '../../config/database';
import TransactionService from '../../services/transactionService';
import BudgetService from '../../services/budgetService';

/**
 * Handle text message from LINE user
 */
export async function handleTextMessage(event: MessageEvent): Promise<void> {
  if (event.message.type !== 'text') return;
  
  const message = (event.message as TextMessage).text;
  const lineUserId = event.source.userId;
  
  if (!lineUserId) {
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '❌ 無法識別用戶，請重新加入好友',
    });
    return;
  }
  
  try {
    // 查找 LINE 用戶
    const lineUser = await prisma.lineUser.findUnique({
      where: { lineUserId },
      include: { user: true },
    });
    
    if (!lineUser) {
      await lineClient.replyMessage(event.replyToken, {
        type: 'text',
        text: '👋 歡迎使用 MoneeBunny 記帳機器人！\n\n' +
              '請先完成註冊：\n' +
              '🔗 [點擊此處註冊](https://your-liff-url)\n\n' +
              '註冊完成後即可開始記帳 💰',
      });
      return;
    }
    
    // 嘗試解析為查詢指令
    const command = parseCommand(message);
    
    if (command.type !== 'UNKNOWN') {
      await handleCommand(event, lineUser.userId, command.type);
      return;
    }
    
    // 嘗試解析為記帳訊息
    const parsed = parseTransactionMessage(message);
    
    if (parsed) {
      await handleTransaction(event, lineUser.userId, parsed);
      return;
    }
    
    // 無法識別的訊息
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '❓ 無法識別您的指令\n\n' +
            '請輸入「幫助」查看使用說明',
    });
    
  } catch (error) {
    console.error('Error handling text message:', error);
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '❌ 處理訊息時發生錯誤，請稍後再試',
    });
  }
}

/**
 * Handle transaction recording
 */
async function handleTransaction(
  event: MessageEvent,
  userId: string,
  parsed: { type: string; amount: number; category?: string; description?: string }
): Promise<void> {
  try {
    // 建立交易記錄
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
    
    // 計算本月同分類支出
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
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
    
    // 回覆訊息
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

/**
 * Handle query commands
 */
async function handleCommand(
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
 * Handle "今日支出" command
 */
async function handleTodayExpense(event: MessageEvent, userId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
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
 * Handle "本月支出" command
 */
async function handleMonthExpense(event: MessageEvent, userId: string): Promise<void> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  // 按分類統計
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
 * Handle "本月預算" command
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
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
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
      
      const status = percentage > 100 ? '⚠️' : percentage > 80 ? '🟡' : '✅';
      
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
 * Handle "統計" command
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

/**
 * Get emoji for category
 */
function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'Food & Dining': '🍔',
    'Transportation': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎮',
    'Housing': '🏠',
    'Healthcare': '🏥',
    'Salary': '💰',
    'Bonus': '🎁',
    'Part-time': '💼',
    'Gift': '🧧',
  };
  
  return emojiMap[category] || '📝';
}
