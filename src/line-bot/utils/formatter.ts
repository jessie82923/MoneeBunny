/**
 * Formatting utilities for LINE Bot messages
 * 
 * @remarks Contains helper functions for formatting amounts, dates, and categories
 */

/**
 * Get emoji icon for transaction category
 * 
 * @param category - Transaction category name
 * @returns Corresponding emoji or default 📝
 */
export function getCategoryEmoji(category: string): string {
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
    'Other': '📝',
  };
  
  return emojiMap[category] || '📝';
}

/**
 * Get start of month date (00:00:00)
 * 
 * @returns Date object set to first day of current month at midnight
 */
export function getStartOfMonth(): Date {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get start and end of today
 * 
 * @returns Tuple of [todayStart, todayEnd]
 */
export function getTodayRange(): [Date, Date] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return [today, tomorrow];
}

/**
 * Format budget percentage with status emoji
 * 
 * @param spent - Amount spent
 * @param budget - Budget amount
 * @returns Status emoji (✅/🟡/⚠️)
 */
export function getBudgetStatusEmoji(spent: number, budget: number): string {
  const percentage = (spent / budget) * 100;
  
  if (percentage > 100) return '⚠️';
  if (percentage > 80) return '🟡';
  return '✅';
}
