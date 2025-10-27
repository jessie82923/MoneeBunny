/**
 * Daily Report Flex Message
 * 日度報表卡片
 */

import { FlexMessage } from '@line/bot-sdk';
import { formatAmount } from '../../parsers/transactionParser';
import { getCategoryEmoji } from '../../utils/formatter';
import type { DailyReportData } from '../../types';

/**
 * 建立日度花費報表的 Flex Message 卡片
 * 
 * @param report - 報表資料
 * @returns Flex Message 物件
 */
export function createDailyReportCard(report: DailyReportData): FlexMessage {
  const balanceColor = '#2964d1ff';
  const balanceEmoji = '💸';

  const dateStr = report.date.toLocaleDateString('zh-TW', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric' 
  });

  return {
    type: 'flex',
    altText: `📊 ${dateStr} 支出報表 - 總計 ${formatAmount(report.totalExpense)}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `📊 ${dateStr}`,
            weight: 'bold',
            color: '#FFFFFF',
            size: 'xl',
          }
        ],
        backgroundColor: '#79a6fcff',
        paddingAll: '20px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          // 收支總覽
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: `${balanceEmoji} 總支出`,
                    color: '#666666',
                    size: 'md',
                    flex: 2,
                    weight: 'bold',
                  },
                  {
                    type: 'text',
                    text: formatAmount(report.totalExpense),
                    wrap: true,
                    color: balanceColor,
                    size: 'lg',
                    flex: 3,
                    align: 'end',
                    weight: 'bold',
                  },
                ],
              },
            ],
          },
          // 分隔線
          {
            type: 'separator',
            margin: 'xl',
          },
          // 交易明細列表
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'md',
            contents: [
              {
                type: 'text',
                text: '📝 交易明細',
                weight: 'bold',
                color: '#1D3557',
                size: 'md',
              },
              // 每筆交易
              ...report.transactions.map((transaction, index) => ({
                type: 'box' as const,
                layout: 'vertical' as const,
                spacing: 'sm' as const,
                margin: 'md' as const,
                contents: [
                  // 主要資訊列
                  {
                    type: 'box' as const,
                    layout: 'baseline' as const,
                    spacing: 'sm' as const,
                    contents: [
                      {
                        type: 'text' as const,
                        text: `${index + 1}.`,
                        color: '#AAAAAA',
                        size: 'sm' as const,
                        flex: 0,
                      },
                      {
                        type: 'text' as const,
                        text: `${getCategoryEmoji(transaction.category)} ${transaction.category}`,
                        color: '#666666',
                        size: 'sm' as const,
                        flex: 3,
                        weight: 'bold' as const,
                      },
                      {
                        type: 'text' as const,
                        text: formatAmount(transaction.amount),
                        wrap: true,
                        color: '#1D3557',
                        size: 'sm' as const,
                        flex: 2,
                        align: 'end' as const,
                        weight: 'bold' as const,
                      },
                    ],
                  },
                  // 備註（如果有）
                  ...(transaction.description
                    ? [
                        {
                          type: 'text' as const,
                          text: `   ${transaction.description}`,
                          color: '#999999',
                          size: 'xs' as const,
                          wrap: true,
                          margin: 'sm' as const,
                        },
                      ]
                    : []),
                ],
              })),
            ],
          },
        ],
      },
    },
  };
}
