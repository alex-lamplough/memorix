import Stripe from 'stripe';
import { config } from '../config/config.js';

// Initialize Stripe with the secret key
const stripe = new Stripe(config.stripe.secretKey);

/**
 * Creates a Stripe customer if it doesn't exist
 * @param {Object} user - User object with email
 * @returns {Promise<Object>} Stripe customer object
 */
export const createOrRetrieveCustomer = async (user) => {
  try {
    // Check if customer exists in database first
    // This depends on your user schema, which should include a stripeCustomerId field
    if (user.stripeCustomerId) {
      // Get existing customer
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      if (!customer.deleted) {
        return customer;
      }
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || user.email,
      metadata: {
        userId: user.id || user._id.toString()
      }
    });

    // Update user with Stripe customer ID in your database
    // This implementation will depend on your database structure
    // Example: await updateUserStripeId(user.id, customer.id);

    return customer;
  } catch (error) {
    console.error('Error in createOrRetrieveCustomer:', error);
    throw error;
  }
};

/**
 * Creates a checkout session for subscription
 * @param {Object} options - Options for creating checkout session
 * @returns {Promise<Object>} Checkout session
 */
export const createCheckoutSession = async ({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata = {}
}) => {
  try {
    console.log('Creating checkout session with params:', {
      customer: customerId,
      priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    
    // Check if we have Stripe initialized correctly
    if (!stripe) {
      console.error('Stripe object is not initialized properly');
      throw new Error('Stripe is not initialized');
    }
    
    // Log the Stripe secret key (first 6 chars only for security)
    const secretKeyPreview = config.stripe.secretKey ? 
      `${config.stripe.secretKey.substring(0, 6)}...` : 'undefined or empty';
    console.log(`Using Stripe secret key: ${secretKeyPreview}`);
    
    // Log the price ID being used
    console.log(`Using price ID: ${priceId}`);
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    console.log('Successfully created checkout session:', {
      id: session.id,
      url: session.url
    });
    
    return session;
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    console.error('Error details:', error.message);
    if (error.type) {
      console.error('Stripe error type:', error.type);
    }
    if (error.code) {
      console.error('Stripe error code:', error.code);
    }
    if (error.param) {
      console.error('Invalid parameter:', error.param);
    }
    throw error;
  }
};

/**
 * Creates a portal session for managing subscriptions
 * @param {string} customerId - Stripe customer ID
 * @param {string} returnUrl - URL to return to after portal session
 * @returns {Promise<Object>} Portal session
 */
export const createPortalSession = async (customerId, returnUrl) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error('Error in createPortalSession:', error);
    throw error;
  }
};

/**
 * Retrieves subscription details
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Subscription details
 */
export const getSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error in getSubscription:', error);
    throw error;
  }
};

/**
 * Cancels a subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Cancelled subscription
 */
export const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    throw error;
  }
};

/**
 * Handles Stripe webhook events
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Promise<Object>} Processed webhook event
 */
export const handleWebhookEvent = async (payload, signature) => {
  try {
    console.log('Verifying webhook signature with secret:', config.stripe.webhookSecret ? `${config.stripe.webhookSecret.substring(0, 6)}...` : 'missing');
    
    if (!config.stripe.webhookSecret) {
      throw new Error('Webhook secret is not configured');
    }
    
    if (!signature) {
      throw new Error('No Stripe signature found in headers');
    }
    
    // Verify and construct the event
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhookSecret
    );
    
    console.log('Webhook event successfully verified:', event.id, event.type);
    
    // Log the event data for debugging
    console.log('Event data:', JSON.stringify(event.data.object).substring(0, 500) + '...');
    
    return event;
  } catch (error) {
    console.error('Error in handleWebhookEvent:', error.message);
    if (error.type === 'StripeSignatureVerificationError') {
      console.error('Webhook signature verification failed');
    }
    throw error;
  }
};

export const stripeService = {
  createOrRetrieveCustomer,
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  handleWebhookEvent,
};

export default stripeService; 