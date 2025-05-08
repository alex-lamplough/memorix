/**
 * Simple script to test if the Stripe webhook endpoint is correctly configured
 * 
 * To use, run: node test-webhook.js
 */

import fetch from 'node-fetch';
import logger from '../src/utils/logger.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

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
      id: 'sub_test123',
      object: 'subscription',
      customer: 'cus_test123',
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 30*24*60*60,
      items: {
        data: [
          {
            id: 'si_test123',
            price: {
              id: 'price_test123'
            }
          }
        ]
      }
    }
  },
  type: 'customer.subscription.created',
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

// The endpoints to test
const endpoints = [
  'http://localhost:5001/webhook',
  'http://localhost:5001/api/webhook',
  'http://localhost:5001/api/stripe/webhook',
  'http://localhost:5001/api/subscriptions/webhook'
];

// Function to test one endpoint
const testEndpoint = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': stripeSignature
      },
      body: payload
    });
    
    const responseText = await response.text();
    
    logger.debug(`${url} - Status: ${response.status}`);
    logger.debug(`Response: ${responseText}`);
    logger.debug('-----------------------------------');
    
    return response.status === 200;
  } catch (error) {
    logger.error(`Error testing ${url}:`, { value: error.message });
    return false;
  }
};

// Run tests for all endpoints
(async () => {
  logger.debug('Testing Stripe webhook endpoints...');
  logger.debug('===================================');
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) successCount++;
  }
  
  logger.debug(`Results: ${successCount}/${endpoints.length} endpoints working correctly`);
  
  if (successCount === 0) {
    logger.error('❌ All webhook tests failed. Check that your server is running and webhook routes are configured correctly.');
  } else if (successCount === endpoints.length) {
    logger.debug('✅ All webhook endpoints are working correctly!');
  } else {
    logger.debug('⚠️ Some webhook endpoints are working, but not all.');
  }
})(); 