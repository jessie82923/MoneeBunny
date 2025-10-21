import { Router, Request, Response } from 'express';
import { WebhookEvent } from '@line/bot-sdk';
import { verifySignature } from '../line-bot/lineClient';
import { handleTextMessage, handleFollowEvent, handleUnfollowEvent } from '../line-bot/handlers/messageHandler';

const router = Router();

/**
 * LINE Webhook endpoint
 * Receives events from LINE Platform
 * 
 * @remarks Validates signature and routes events to appropriate handlers
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-line-signature'] as string;
    
    if (!signature) {
      console.error('Missing signature');
      return res.status(401).json({ error: 'Missing signature' });
    }
    
    // Verify webhook signature
    const body = JSON.stringify(req.body);
    if (!verifySignature(body, signature)) {
      console.error('Invalid signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }
    
    const events: WebhookEvent[] = req.body.events;
    
    // Process each event
    await Promise.all(
      events.map(async (event) => {
        try {
          console.log('Received event:', event.type);
          
          switch (event.type) {
            case 'message':
              if (event.message.type === 'text') {
                await handleTextMessage(event);
              }
              break;
              
            case 'follow':
              await handleFollowEvent(event);
              break;
              
            case 'unfollow':
              await handleUnfollowEvent(event);
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
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'LINE Bot is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
