/**
 * Simple script to test if the Stripe webhook endpoint is correctly configured
 * using a direct curl command similar to how Stripe would send webhooks
 * 
 * To use, run: node test-webhook-simple.js
 */

import { exec } from 'child_process';
import logger from './utils/logger';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get the webhook secret from environment
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  logger.error('STRIPE_WEBHOOK_SECRET not found in environment variables');
  process.exit(1);
}

// Create a simple test event payload
const payload = JSON.stringify({
  id: 'evt_test_webhook_check',
  object: 'event',
  api_version: '2023-10-16',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'pi_test123',
      object: 'payment_intent',
      amount: 1099,
      currency: 'usd',
      status: 'succeeded',
      customer: 'cus_test123'
    }
  },
  type: 'payment_intent.succeeded',
  livemode: false
});

// Calculate the signature
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payload}`;
const signature = crypto.createHmac('sha256', webhookSecret)
  .update(signedPayload)
  .digest('hex');

// Create the Stripe signature header
const stripeSignature = `t=${timestamp},v1=${signature}`;

// The endpoint to test
const endpoint = 'http://localhost:5001/webhook';

// Create a temporary file with the payload
const tmpFile = './test-payload.json';
fs.writeFileSync(tmpFile, payload);

// Build curl command - this closely resembles how Stripe sends webhooks
const curlCommand = `curl -X POST ${endpoint} \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: ${stripeSignature}" \
  --data @${tmpFile}`;

logger.debug('Testing webhook with the following command:');
console.log(curlCommand);
logger.debug('-----------------------------------------');

// Execute the curl command
exec(curlCommand, (error, stdout, stderr) => {
  // Clean up temporary file
  fs.unlinkSync(tmpFile);
  
  if (error) {
    logger.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    logger.error(`Stderr: ${stderr}`);
    return;
  }
  
  logger.debug('Response:');
  console.log(stdout || '(empty response - this is good, means 200 OK)');
  logger.debug('-----------------------------------------');
  logger.debug('✅ Test completed. Check your server logs for webhook processing details.');
}); 