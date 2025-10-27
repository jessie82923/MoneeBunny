/**
 * Transaction Flex Message Card
 * 美化的交易記錄卡片
 */

import { FlexMessage } from '@line/bot-sdk';
import { formatAmount } from '../../parsers/transactionParser';
import { getCategoryEmoji } from '../../utils/formatter';
import type { TransactionCardData } from '../../types';

/**
 * 建立交易記錄的 Flex Message 卡片
 * 
 * @param transaction - 交易資料
 * @returns Flex Message 物件
 */
export function createTransactionCard(transaction: TransactionCardData): FlexMessage {
  const isIncome = transaction.type === 'INCOME';
  const emoji = isIncome ? '💰' : '💸';
  const typeText = isIncome ? '收入' : '支出';
  const color = isIncome ? '#06C755' : '#FF6B6B';
  const categoryEmoji = getCategoryEmoji(transaction.category);

  return {
    type: 'flex',
    altText: `${emoji} 已記錄${typeText}：${transaction.description || transaction.category} NT$${transaction.amount}`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${emoji} ${typeText}記錄成功`,
            weight: 'bold',
            color: '#FFFFFF',
            size: 'xl',
          },
        ],
        backgroundColor: color,
        paddingAll: '20px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          // 金額顯示
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: '金額',
                color: '#AAAAAA',
                size: 'sm',
                flex: 0,
              },
              {
                type: 'text',
                text: formatAmount(transaction.amount),
                weight: 'bold',
                size: '3xl',
                flex: 0,
                color: color,
              },
            ],
            spacing: 'sm',
          },
          // 分隔線
          {
            type: 'separator',
            margin: 'xl',
          },
          // 詳細資訊
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              // 分類
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '分類',
                    color: '#AAAAAA',
                    size: 'sm',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: `${categoryEmoji} ${transaction.category}`,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 4,
                    weight: 'bold',
                  },
                ],
              },
              // 備註
              ...(transaction.description
                ? [
                    {
                      type: 'box' as const,
                      layout: 'baseline' as const,
                      spacing: 'sm' as const,
                      contents: [
                        {
                          type: 'text' as const,
                          text: '備註',
                          color: '#AAAAAA',
                          size: 'sm' as const,
                          flex: 1,
                        },
                        {
                          type: 'text' as const,
                          text: transaction.description,
                          wrap: true,
                          color: '#666666',
                          size: 'sm' as const,
                          flex: 4,
                        },
                      ],
                    },
                  ]
                : []),
              // 日期
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '日期',
                    color: '#AAAAAA',
                    size: 'sm',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: transaction.date.toLocaleDateString('zh-TW'),
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 4,
                  },
                ],
              },
            ],
          },
          // 本月統計（如果有）
          ...(transaction.monthlyTotal
            ? [
                {
                  type: 'separator' as const,
                  margin: 'xl' as const,
                },
                {
                  type: 'box' as const,
                  layout: 'vertical' as const,
                  margin: 'lg' as const,
                  contents: [
                    {
                      type: 'text' as const,
                      text: `📊 本月「${transaction.category}」${typeText}`,
                      color: '#AAAAAA',
                      size: 'xs' as const,
                    },
                    {
                      type: 'text' as const,
                      text: formatAmount(transaction.monthlyTotal),
                      color: color,
                      weight: 'bold' as const,
                      size: 'lg' as const,
                    },
                  ],
                },
              ]
            : []),
        ],
      },
      styles: {
        footer: {
          separator: false,
        },
      },
    },
  };
}
