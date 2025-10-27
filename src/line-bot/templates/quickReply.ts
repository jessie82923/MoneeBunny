/**
 * Quick Reply Templates
 * 快速回覆按鈕模板
 */

import { QuickReply } from '@line/bot-sdk';

/**
 * 主選單快捷按鈕
 */
export const mainMenuQuickReply: QuickReply = {
  items: [
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📝 記帳',
        text: '早餐 50',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '💰 今日支出',
        text: '今日支出',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📊 本月支出',
        text: '本月支出',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📖 幫助',
        text: '幫助',
      },
    },
  ],
};

/**
 * 記帳分類快捷按鈕
 */
export const categoryQuickReply: QuickReply = {
  items: [
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🍔 飲食',
        text: '早餐 ',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🚗 交通',
        text: '交通 ',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🛍️ 購物',
        text: '購物 ',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🎮 娛樂',
        text: '娛樂 ',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🏠 居住',
        text: '房租 ',
      },
    },
  ],
};

/**
 * 查詢功能快捷按鈕
 */
export const queryQuickReply: QuickReply = {
  items: [
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📅 今日支出',
        text: '今日支出',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📊 本月支出',
        text: '本月支出',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📈 統計',
        text: '統計',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🔙 選單',
        text: '幫助',
      },
    },
  ],
};

/**
 * 收入類型快捷按鈕
 */
export const incomeQuickReply: QuickReply = {
  items: [
    {
      type: 'action',
      action: {
        type: 'message',
        label: '💰 薪水',
        text: '薪水 ',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🎁 獎金',
        text: '獎金 ',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '💼 兼職',
        text: '兼職 ',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🧧 紅包',
        text: '紅包 ',
      },
    },
  ],
};

/**
 * 確認/取消快捷按鈕
 */
export const confirmQuickReply: QuickReply = {
  items: [
    {
      type: 'action',
      action: {
        type: 'message',
        label: '✅ 確認',
        text: '確認',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '❌ 取消',
        text: '取消',
      },
    },
  ],
};
