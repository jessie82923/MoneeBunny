import { Router, Request, Response } from 'express';
import { WebhookEvent } from '@line/bot-sdk';
import { verifySignature, lineClient } from '../line-bot/lineClient';
import { handleTextMessage } from '../line-bot/handlers/messageHandler';
import prisma from '../config/database';

const router = Router();

/**
 * LINE Webhook endpoint
 * Receives events from LINE Platform
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-line-signature'] as string;
    
    if (!signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }
    
    // Verify webhook signature
    const body = JSON.stringify(req.body);
    if (!verifySignature(body, signature)) {
      return res.status(403).json({ error: 'Invalid signature' });
    }
    
    const events: WebhookEvent[] = req.body.events;
    
    // Process each event
    await Promise.all(
      events.map(async (event) => {
        try {
          switch (event.type) {
            case 'message':
              if (event.message.type === 'text') {
                await handleTextMessage(event);
              }
              break;
              
            case 'follow':
              // User added bot as friend
              await handleFollowEvent(event);
              break;
              
            case 'unfollow':
              // User blocked or removed bot
              console.log('User unfollowed:', event.source.userId);
              break;
              
            default:
              console.log('Unhandled event type:', event.type);
          }
        } catch (error) {
          console.error('Error processing event:', error);
        }
      })
    );
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Handle user follow event
 */
async function handleFollowEvent(event: WebhookEvent): Promise<void> {
  if (event.type !== 'follow') return;
  
  const userId = event.source.userId;
  
  if (!userId) return;
  
  try {
    // Check if LINE user already exists
    const existingLineUser = await prisma.lineUser.findUnique({
      where: { lineUserId: userId },
    });
    
    if (existingLineUser) {
      // Welcome back message
      await lineClient.pushMessage(userId, {
        type: 'text',
        text: '👋 歡迎回來！\n\n' +
              '您可以繼續使用記帳功能\n' +
              '輸入「幫助」查看使用說明',
      });
    } else {
      // Get LINE profile
      const profile = await lineClient.getProfile(userId);
      
      // Welcome new user
      await lineClient.pushMessage(userId, {
        type: 'text',
        text: `👋 歡迎，${profile.displayName}！\n\n` +
              '這是 MoneeBunny 記帳機器人\n\n' +
              '請先完成註冊：\n' +
              '🔗 https://your-liff-url\n\n' +
              '註冊完成後即可開始記帳 💰\n\n' +
              '輸入「幫助」查看使用說明',
      });
    }
  } catch (error) {
    console.error('Error handling follow event:', error);
  }
}

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'LINE Bot is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
