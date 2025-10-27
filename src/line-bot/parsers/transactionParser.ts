/**
 * Transaction Parser - 解析用戶記帳訊息
 */

import type { ParsedTransaction } from '../types';

/**
 * 分類關鍵字映射
 */
const CATEGORY_KEYWORDS: Record<string, string> = {
  // 飲食
  '早餐': 'Food & Dining',
  '午餐': 'Food & Dining',
  '晚餐': 'Food & Dining',
  '宵夜': 'Food & Dining',
  '飲料': 'Food & Dining',
  '咖啡': 'Food & Dining',
  '餐廳': 'Food & Dining',
  '便當': 'Food & Dining',
  
  // 交通
  '交通': 'Transportation',
  '公車': 'Transportation',
  '捷運': 'Transportation',
  '計程車': 'Transportation',
  '加油': 'Transportation',
  '停車': 'Transportation',
  '油錢': 'Transportation',
  
  // 購物
  '購物': 'Shopping',
  '衣服': 'Shopping',
  '鞋子': 'Shopping',
  
  // 娛樂
  '娛樂': 'Entertainment',
  '電影': 'Entertainment',
  '遊戲': 'Entertainment',
  '旅遊': 'Entertainment',
  
  // 居住
  '房租': 'Housing',
  '水電': 'Housing',
  '瓦斯': 'Housing',
  '網路': 'Housing',
  
  // 醫療
  '醫療': 'Healthcare',
  '看病': 'Healthcare',
  '藥品': 'Healthcare',
  
  // 收入
  '薪水': 'Salary',
  '獎金': 'Bonus',
  '兼職': 'Part-time',
  '紅包': 'Gift',
};

/**
 * 解析記帳訊息
 * 
 * 支援格式：
 * - "早餐 50" → { type: EXPENSE, amount: 50, category: Food & Dining }
 * - "午餐 120 便當" → { type: EXPENSE, amount: 120, category: Food & Dining, description: 便當 }
 * - "-50 飲料" → { type: EXPENSE, amount: 50, description: 飲料 }
 * - "+5000 薪水" → { type: INCOME, amount: 5000, category: Salary }
 * - "薪水 50000" → { type: INCOME, amount: 50000, category: Salary }
 */
export function parseTransactionMessage(message: string): ParsedTransaction | null {
  const trimmed = message.trim();
  
  // 格式 1: "+5000" 或 "-50" 開頭
  const signPattern = /^([+\-])(\d+)\s*(.*)$/;
  const signMatch = trimmed.match(signPattern);
  
  if (signMatch) {
    const [, sign, amountStr, description] = signMatch;
    return {
      type: sign === '+' ? 'INCOME' : 'EXPENSE',
      amount: parseInt(amountStr, 10),
      description: description.trim() || undefined,
      category: inferCategory(description.trim()),
    };
  }
  
  // 格式 2: "早餐 50" 或 "早餐 50 蛋餅"
  const categoryPattern = /^(.+?)\s+(\d+)\s*(.*)$/;
  const categoryMatch = trimmed.match(categoryPattern);
  
  if (categoryMatch) {
    const [, keyword, amountStr, description] = categoryMatch;
    const category = CATEGORY_KEYWORDS[keyword] || keyword;
    const isIncome = isIncomeKeyword(keyword);
    
    return {
      type: isIncome ? 'INCOME' : 'EXPENSE',
      amount: parseInt(amountStr, 10),
      category,
      description: description.trim() || undefined,
    };
  }
  
  // 格式 3: "50 早餐" (金額在前)
  const amountFirstPattern = /^(\d+)\s+(.+)$/;
  const amountFirstMatch = trimmed.match(amountFirstPattern);
  
  if (amountFirstMatch) {
    const [, amountStr, rest] = amountFirstMatch;
    const category = inferCategory(rest);
    
    return {
      type: 'EXPENSE',
      amount: parseInt(amountStr, 10),
      category,
      description: rest.trim(),
    };
  }
  
  return null;
}

/**
 * 推斷分類
 */
function inferCategory(text: string): string | undefined {
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (text.includes(keyword)) {
      return category;
    }
  }
  return undefined;
}

/**
 * 判斷是否為收入關鍵字
 */
function isIncomeKeyword(keyword: string): boolean {
  const incomeKeywords = ['薪水', '獎金', '兼職', '紅包', '收入'];
  return incomeKeywords.includes(keyword);
}

/**
 * 格式化金額顯示
 */
export function formatAmount(amount: number): string {
  return `NT$${amount.toLocaleString()}`;
}

// Re-export type for external use
export type { ParsedTransaction } from '../types';
