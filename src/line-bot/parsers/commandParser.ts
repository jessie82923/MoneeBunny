/**
 * Command Parser - 解析用戶查詢指令
 */

export type CommandType = 
  | 'TODAY_EXPENSE'     // 今日支出
  | 'MONTH_EXPENSE'     // 本月支出
  | 'MONTH_BUDGET'      // 本月預算
  | 'STATISTICS'        // 統計報表
  | 'HELP'              // 幫助
  | 'UNKNOWN';          // 未知指令

export interface ParsedCommand {
  type: CommandType;
  parameters?: Record<string, any>;
}

/**
 * 指令關鍵字映射
 */
const COMMAND_KEYWORDS: Record<string, CommandType> = {
  '今日': 'TODAY_EXPENSE',
  '今天': 'TODAY_EXPENSE',
  '本日': 'TODAY_EXPENSE',
  
  '本月': 'MONTH_EXPENSE',
  '這個月': 'MONTH_EXPENSE',
  '月支出': 'MONTH_EXPENSE',
  
  '預算': 'MONTH_BUDGET',
  '本月預算': 'MONTH_BUDGET',
  
  '統計': 'STATISTICS',
  '報表': 'STATISTICS',
  '分析': 'STATISTICS',
  
  '幫助': 'HELP',
  '說明': 'HELP',
  '指令': 'HELP',
  'help': 'HELP',
};

/**
 * 解析查詢指令
 */
export function parseCommand(message: string): ParsedCommand {
  const trimmed = message.trim().toLowerCase();
  
  // 完全匹配
  for (const [keyword, type] of Object.entries(COMMAND_KEYWORDS)) {
    if (trimmed === keyword || trimmed.includes(keyword)) {
      return { type };
    }
  }
  
  // 模糊匹配（包含關鍵字）
  if (trimmed.includes('支出') || trimmed.includes('花費')) {
    if (trimmed.includes('今') || trimmed.includes('天')) {
      return { type: 'TODAY_EXPENSE' };
    }
    if (trimmed.includes('月')) {
      return { type: 'MONTH_EXPENSE' };
    }
  }
  
  return { type: 'UNKNOWN' };
}

/**
 * 獲取指令說明
 */
export function getCommandHelp(): string {
  return `📝 記帳指令說明

【快速記帳】
• 早餐 50
• 午餐 120 便當
• 交通 30 公車
• -50 飲料
• +5000 薪水

【查詢指令】
• 今日支出
• 本月支出
• 本月預算
• 統計

【分類關鍵字】
🍔 飲食: 早餐、午餐、晚餐、飲料
🚗 交通: 公車、捷運、計程車、加油
🛍️ 購物: 購物、衣服、鞋子
🎮 娛樂: 電影、遊戲、旅遊
🏠 居住: 房租、水電、瓦斯
💰 收入: 薪水、獎金、兼職、紅包

輸入「幫助」可隨時查看此說明`;
}
