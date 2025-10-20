import { Client, ClientConfig } from '@line/bot-sdk';

/**
 * LINE Bot Client Configuration
 */
const config: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

/**
 * LINE Bot SDK Client Instance
 */
export const lineClient = new Client(config);

/**
 * Verify LINE webhook signature
 */
export function verifySignature(body: string, signature: string): boolean {
  const crypto = require('crypto');
  const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
  
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');
  
  return hash === signature;
}
