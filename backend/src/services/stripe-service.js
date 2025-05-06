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

    return session;
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
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
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhookSecret
    );

    // Process different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Handle subscription created/updated
        const subscription = event.data.object;
        // Update user's subscription status in your database
        // Example: await updateUserSubscription(subscription);
        break;
      case 'customer.subscription.deleted':
        // Handle subscription cancelled
        const cancelledSubscription = event.data.object;
        // Update user's subscription status in your database
        // Example: await cancelUserSubscription(cancelledSubscription);
        break;
      case 'invoice.payment_succeeded':
        // Handle successful payment
        const invoice = event.data.object;
        // Update payment records in your database
        // Example: await recordSuccessfulPayment(invoice);
        break;
      case 'invoice.payment_failed':
        // Handle failed payment
        const failedInvoice = event.data.object;
        // Update payment status and notify user
        // Example: await handleFailedPayment(failedInvoice);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type: ${event.type}`);
    }

    return event;
  } catch (error) {
    console.error('Error in handleWebhookEvent:', error);
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