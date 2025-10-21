import { MessageEvent, TextMessage } from '@line/bot-sdk';
import { lineClient } from '../lineClient';
import { parseTransactionMessage } from '../parsers/transactionParser';
import { parseCommand } from '../parsers/commandParser';
import { handleTransactionRecord } from './transactionHandler';
import { handleQueryCommand } from './queryHandler';
import prisma from '../../config/database';

/**
 * Handle text message from LINE user
 * Routes message to appropriate handler based on content
 * 
 * @param event - LINE message event
 * @remarks Performs message routing: transaction recording vs query commands
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
    // Find LINE user account
    const lineUser = await prisma.lineUser.findUnique({
      where: { lineUserId },
      include: { user: true },
    });
    
    if (!lineUser) {
      await lineClient.replyMessage(event.replyToken, {
        type: 'text',
        text: '❌ 找不到您的帳號\n\n請重新加入好友以自動建立帳號',
      });
      return;
    }
    
    // Try parsing as query command
    const command = parseCommand(message);
    
    if (command.type !== 'UNKNOWN') {
      await handleQueryCommand(event, lineUser.userId, command.type);
      return;
    }
    
    // Try parsing as transaction message
    const parsed = parseTransactionMessage(message);
    
    if (parsed) {
      await handleTransactionRecord(event, lineUser.userId, parsed);
      return;
    }
    
    // Unknown message format
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

// Re-export handlers from their dedicated modules
export { handleFollowEvent, handleUnfollowEvent } from './followHandler';