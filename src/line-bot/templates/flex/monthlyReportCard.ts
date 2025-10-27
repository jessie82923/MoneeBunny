/**
 * Monthly Report Flex Message
 * 月度報表卡片
 */

import { FlexMessage } from '@line/bot-sdk';
import { formatAmount } from '../../parsers/transactionParser';
import { getCategoryEmoji } from '../../utils/formatter';
import type { MonthlyReportData, CategoryStat } from '../../types';

/**
 * 建立月度報表的 Flex Message 卡片
 * 
 * @param report - 報表資料
 * @returns Flex Message 物件
 */
export function createMonthlyReportCard(report: MonthlyReportData): FlexMessage {
  const balance = report.totalIncome - report.totalExpense;
  const balanceColor = balance >= 0 ? '#06C755' : '#FF6B6B';
  const balanceEmoji = balance >= 0 ? '💰' : '⚠️';

  // 取前 5 名分類
  const topCategories = report.categories.slice(0, 5);

  return {
    type: 'flex',
    altText: `📊 ${report.year}年${report.month}月帳務報表`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `📊 ${report.month}月帳務報表`,
            weight: 'bold',
            color: '#FFFFFF',
            size: 'xl',
          },
          {
            type: 'text',
            text: `${report.year}年`,
            color: '#FFFFFF',
            size: 'sm',
          },
        ],
        backgroundColor: '#17C3B2',
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
                    text: '💰 收入',
                    color: '#AAAAAA',
                    size: 'sm',
                    flex: 2,
                  },
                  {
                    type: 'text',
                    text: formatAmount(report.totalIncome),
                    wrap: true,
                    color: '#06C755',
                    size: 'md',
                    flex: 3,
                    align: 'end',
                    weight: 'bold',
                  },
                ],
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '💸 支出',
                    color: '#AAAAAA',
                    size: 'sm',
                    flex: 2,
                  },
                  {
                    type: 'text',
                    text: formatAmount(report.totalExpense),
                    wrap: true,
                    color: '#FF6B6B',
                    size: 'md',
                    flex: 3,
                    align: 'end',
                    weight: 'bold',
                  },
                ],
              },
              {
                type: 'separator',
                margin: 'md',
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: `${balanceEmoji} 結餘`,
                    color: '#666666',
                    size: 'md',
                    flex: 2,
                    weight: 'bold',
                  },
                  {
                    type: 'text',
                    text: formatAmount(Math.abs(balance)),
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
          // 與上月比較
          ...(report.compareLastMonth
            ? [
                {
                  type: 'box' as const,
                  layout: 'baseline' as const,
                  margin: 'md' as const,
                  contents: [
                    {
                      type: 'text' as const,
                      text: '📈 較上月',
                      color: '#AAAAAA',
                      size: 'xs' as const,
                      flex: 2,
                    },
                    {
                      type: 'text' as const,
                      text: `${report.compareLastMonth.trend === 'up' ? '↑' : '↓'} ${report.compareLastMonth.percentage}%`,
                      wrap: true,
                      color: report.compareLastMonth.trend === 'up' ? '#FF6B6B' : '#06C755',
                      size: 'sm' as const,
                      flex: 3,
                      align: 'end' as const,
                    },
                  ],
                },
              ]
            : []),
          // 分類支出排行
          {
            type: 'separator',
            margin: 'xl',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '🏆 支出排行 TOP 5',
                weight: 'bold',
                color: '#1D3557',
                size: 'md',
              },
              ...topCategories.map((cat, index) => ({
                type: 'box' as const,
                layout: 'baseline' as const,
                spacing: 'sm' as const,
                margin: 'md' as const,
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
                    text: `${getCategoryEmoji(cat.category)} ${cat.category}`,
                    color: '#666666',
                    size: 'sm' as const,
                    flex: 3,
                  },
                  {
                    type: 'text' as const,
                    text: formatAmount(cat.amount),
                    wrap: true,
                    color: '#1D3557',
                    size: 'sm' as const,
                    flex: 2,
                    align: 'end' as const,
                    weight: 'bold' as const,
                  },
                  {
                    type: 'text' as const,
                    text: `${cat.percentage}%`,
                    wrap: true,
                    color: '#AAAAAA',
                    size: 'xs' as const,
                    flex: 1,
                    align: 'end' as const,
                  },
                ],
              })),
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'link',
            height: 'sm',
            action: {
              type: 'message',
              label: '查看詳細報表',
              text: '詳細統計',
            },
          },
        ],
        flex: 0,
      },
    },
  };
}
