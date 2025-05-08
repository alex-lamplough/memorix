import Stripe from 'stripe';
import { config } from '../config/config.js';

// Initialize Stripe with the secret key
console.log('Stripe Secret Key at init:', config.stripe.secretKey);
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
  metadata = {},
  couponCode = null
}) => {
  try {
    console.log('Creating checkout session with params:', {
      customer: customerId,
      priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      hasCoupon: !!couponCode
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
    
    // Create session options
    const sessionOptions = {
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
    };
    
    // Add coupon if provided
    if (couponCode) {
      sessionOptions.discounts = [
        {
          coupon: couponCode,
        },
      ];
      console.log(`Applied coupon code: ${couponCode}`);
    }
    
    const session = await stripe.checkout.sessions.create(sessionOptions);

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
 * Updates a subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {Object} updateParams - Parameters to update
 * @returns {Promise<Object>} Updated subscription
 */
export const updateSubscription = async (subscriptionId, updateParams) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, updateParams);
    return subscription;
  } catch (error) {
    console.error('Error in updateSubscription:', error);
    throw error;
  }
};

/**
 * Retrieves a customer
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} Customer details
 */
export const getCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error('Error in getCustomer:', error);
    throw error;
  }
};

/**
 * Updates a customer
 * @param {string} customerId - Stripe customer ID
 * @param {Object} updateParams - Parameters to update
 * @returns {Promise<Object>} Updated customer
 */
export const updateCustomer = async (customerId, updateParams) => {
  try {
    const customer = await stripe.customers.update(customerId, updateParams);
    return customer;
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    throw error;
  }
};

/**
 * Retrieves a payment method
 * @param {string} paymentMethodId - Stripe payment method ID
 * @returns {Promise<Object>} Payment method details
 */
export const getPaymentMethod = async (paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    return paymentMethod;
  } catch (error) {
    console.error('Error in getPaymentMethod:', error);
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
    console.log('Verifying webhook signature...');
    
    if (!config.stripe.webhookSecret) {
      throw new Error('Webhook secret is not configured');
    }
    
    if (!signature) {
      throw new Error('No Stripe signature found in headers');
    }
    
    // Check if payload is a Buffer or string
    let rawBody = payload;
    if (typeof payload !== 'string' && !Buffer.isBuffer(payload)) {
      console.log('Payload is not a string or Buffer. Type:', typeof payload);
      if (payload instanceof Uint8Array) {
        rawBody = Buffer.from(payload);
      } else if (typeof payload === 'object') {
        // If it's an object, stringify it (this is a fallback and not ideal)
        console.log('WARNING: Payload is an object, stringifying it. This is not ideal for signature verification.');
        rawBody = JSON.stringify(payload);
      } else {
        throw new Error(`Unexpected payload type: ${typeof payload}`);
      }
    }
    
    // Log payload snippet for debugging
    if (Buffer.isBuffer(rawBody)) {
      console.log('Payload snippet (Buffer):', rawBody.toString('utf8').substring(0, 50) + '...');
    } else if (typeof rawBody === 'string') {
      console.log('Payload snippet (String):', rawBody.substring(0, 50) + '...');
    }
    
    // Verify and construct the event
    console.log('Using webhook secret:', config.stripe.webhookSecret.substring(0, 8) + '...');
    console.log('Signature header:', signature.substring(0, 20) + '...');
    
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe.webhookSecret
    );
    
    console.log('Webhook event successfully verified:', event.id, event.type);
    
    // Return the event
    return event;
  } catch (error) {
    console.error('Error in handleWebhookEvent:', error.message);
    if (error.type === 'StripeSignatureVerificationError') {
      console.error('Webhook signature verification failed');
      console.error('Expected signature starts with:', error.expected ? error.expected.substring(0, 20) + '...' : 'unknown');
      console.error('Received signature starts with:', error.signature ? error.signature.substring(0, 20) + '...' : 'unknown');
    }
    throw error;
  }
};

/**
 * Retrieves all subscriptions for a customer
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} List of subscriptions
 */
export const getCustomerSubscriptions = async (customerId) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all'
    });
    return subscriptions;
  } catch (error) {
    console.error('Error in getCustomerSubscriptions:', error);
    throw error;
  }
};

export const stripeService = {
  stripe,
  createOrRetrieveCustomer,
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  updateSubscription,
  getCustomer,
  updateCustomer,
  getPaymentMethod,
  handleWebhookEvent,
  getCustomerSubscriptions,
};

export default stripeService; 