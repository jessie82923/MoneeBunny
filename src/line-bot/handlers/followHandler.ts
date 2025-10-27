import { FollowEvent, WebhookEvent } from '@line/bot-sdk';
import { lineClient } from '../lineClient';
import { mainMenuQuickReply } from '../templates/quickReply';
import prisma from '../../config/database';

/**
 * Handle user follow event (add friend)
 * Automatically creates user account when user adds the bot
 * 
 * @param event - LINE follow event
 * @remarks Creates both User and LineUser records in a single transaction
 */
export async function handleFollowEvent(event: FollowEvent): Promise<void> {
  const lineUserId = event.source.userId;
  
  if (!lineUserId) {
    console.error('Follow event missing userId');
    return;
  }
  
  try {
    // Check if already registered
    const existingLineUser = await prisma.lineUser.findUnique({
      where: { lineUserId },
      include: { user: true },
    });
    
    if (existingLineUser) {
      // User already exists, welcome back
      await lineClient.replyMessage(event.replyToken, {
        type: 'text',
        text: `歡迎回來，${existingLineUser.displayName}！🎉`,
      });
      return;
    }
    
    // Fetch LINE profile
    const profile = await lineClient.getProfile(lineUserId);
    
    // Create new user account automatically
    await prisma.user.create({
      data: {
        email: `line_${lineUserId.substring(1, 9)}@moneebunny.local`,
        password: '', // Empty password - can be set later via LIFF
        firstName: profile.displayName,
        lineUser: {
          create: {
            lineUserId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
          },
        },
      },
      include: { lineUser: true },
    });
    
    // Welcome new user with quick reply buttons
    await lineClient.replyMessage(event.replyToken, [
      {
        type: 'text',
        text: `👋 歡迎使用 MoneeBunny 記帳機器人！\n\n你已經可以開始記帳了，試試看：`,
      },
      {
        type: 'text',
        text: '📝 快速記帳範例：\n・早餐 50\n・午餐 120 麵店\n・薪水 50000\n\n💡 輸入「幫助」查看更多功能',
        quickReply: mainMenuQuickReply,
      },
    ]);
    
    console.log(`✅ New user registered: ${profile.displayName} (${lineUserId})`);
    
  } catch (error) {
    console.error('Error handling follow event:', error);
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '❌ 系統錯誤，請稍後再試',
    });
  }
}

/**
 * Handle user unfollow event (block or remove friend)
 * 
 * @param event - LINE unfollow event
 * @remarks Logs the event but does not delete user data to allow re-adding
 */
export async function handleUnfollowEvent(event: WebhookEvent): Promise<void> {
  const lineUserId = event.source.userId;
  
  if (!lineUserId) {
    console.error('Unfollow event missing userId');
    return;
  }
  
  try {
    const lineUser = await prisma.lineUser.findUnique({
      where: { lineUserId },
    });
    
    if (lineUser) {
      console.log(`👋 User unfollowed: ${lineUser.displayName} (${lineUserId})`);
      // Note: We don't delete data, user can re-add and continue
    }
  } catch (error) {
    console.error('Error handling unfollow event:', error);
  }
}
