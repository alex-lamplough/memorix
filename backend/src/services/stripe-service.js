import Stripe from 'stripe';
import logger from '../utils/logger.js';
import { config } from '../config/config.js';

// Initialize Stripe with the secret key
logger.debug('Initializing Stripe service:');
const isProduction = process.env.NODE_ENV === 'production';
logger.debug(`- Running in ${isProduction ? 'production' : 'development'} mode`);

// Check for required configuration
if (!config.stripe.secretKey) {
  logger.error('CRITICAL ERROR: Stripe secret key is missing in configuration');
  logger.error('Please ensure STRIPE_SECRET_KEY is set in environment variables');
} else {
  console.log(`- Using Stripe key: ${config.stripe.secretKey.substring(0, 6)}...`);
}

if (!config.stripe.proPlanPriceId) {
  logger.error('CRITICAL ERROR: Pro plan price ID is missing in configuration');
  logger.error('Please ensure STRIPE_PRO_PLAN is set in environment variables');
} else {
  logger.debug(`- Pro plan price ID: ${config.stripe.proPlanPriceId}`);
}

if (!config.stripe.creatorPlanPriceId) {
  logger.error('CRITICAL ERROR: Creator plan price ID is missing in configuration');
  logger.error('Please ensure STRIPE_CREATOR_PLAN is set in environment variables');
} else {
  logger.debug(`- Creator plan price ID: ${config.stripe.creatorPlanPriceId}`);
}

// Initialize stripe with proper error handling
let stripe = null;
try {
  if (config.stripe.secretKey) {
    stripe = new Stripe(config.stripe.secretKey);
    logger.debug('Stripe service initialized successfully');
  } else {
    logger.error('Failed to initialize Stripe - secret key missing or invalid');
  }
} catch (error) {
  logger.error('Error initializing Stripe client:', { value: error.message });
}

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
    logger.error('Error in createOrRetrieveCustomer:', error);
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
    // Validate required parameters
    if (!customerId) throw new Error('Customer ID is required for creating a checkout session');
    if (!priceId) throw new Error('Price ID is required for creating a checkout session');
    if (!successUrl) throw new Error('Success URL is required for creating a checkout session');
    if (!cancelUrl) throw new Error('Cancel URL is required for creating a checkout session');
    
    logger.debug('Creating checkout session with params:', {
      customer: customerId,
      priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      hasCoupon: !!couponCode
    });
    
    // Check if we have Stripe initialized correctly
    if (!stripe) {
      logger.error('Stripe object is not initialized properly - check environment variables');
      throw new Error('Stripe is not initialized - missing API key');
    }
    
    // Log the Stripe secret key (first 6 chars only for security)
    const secretKeyPreview = config.stripe.secretKey ? 
      `${config.stripe.secretKey.substring(0, 6)}...` : 'undefined or empty';
    logger.debug(`Using Stripe secret key: ${secretKeyPreview}`);
    
    // Log the price ID being used
    logger.debug(`Using price ID: ${priceId}`);
    
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
      logger.debug(`Applied coupon code: ${couponCode}`);
    }
    
    // Create the checkout session with Stripe
    try {
      const session = await stripe.checkout.sessions.create(sessionOptions);

      logger.debug('Successfully created checkout session:', {
        id: session.id,
        url: session.url
      });
      
      return session;
    } catch (stripeApiError) {
      logger.error('Stripe API error in createCheckoutSession:', stripeApiError.message);
      logger.error('Error details:', stripeApiError.message);
      
      if (stripeApiError.type) {
        logger.error('Stripe error type:', stripeApiError.type);
      }
      if (stripeApiError.code) {
        logger.error('Stripe error code:', stripeApiError.code);
      }
      if (stripeApiError.param) {
        logger.error('Invalid parameter:', stripeApiError.param);
      }
      
      // Rethrow with more context for better debugging
      const enhancedError = new Error(`Stripe API error: ${stripeApiError.message}`);
      enhancedError.original = stripeApiError;
      enhancedError.code = stripeApiError.code;
      enhancedError.type = stripeApiError.type;
      enhancedError.param = stripeApiError.param;
      throw enhancedError;
    }
  } catch (error) {
    logger.error('Error in createCheckoutSession:', error);
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
    logger.error('Error in createPortalSession:', error);
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
    logger.error('Error in getSubscription:', error);
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
    logger.error('Error in cancelSubscription:', error);
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
    logger.error('Error in updateSubscription:', error);
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
    logger.error('Error in getCustomer:', error);
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
    logger.error('Error in updateCustomer:', error);
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
    logger.error('Error in getPaymentMethod:', error);
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
    logger.debug('Verifying webhook signature...');
    
    if (!config.stripe.webhookSecret) {
      throw new Error('Webhook secret is not configured');
    }
    
    if (!signature) {
      throw new Error('No Stripe signature found in headers');
    }
    
    // Check if payload is a Buffer or string
    let rawBody = payload;
    if (typeof payload !== 'string' && !Buffer.isBuffer(payload)) {
      logger.debug('Payload is not a string or Buffer. Type:', { value: typeof payload });
      if (payload instanceof Uint8Array) {
        rawBody = Buffer.from(payload);
      } else if (typeof payload === 'object') {
        // If it's an object, stringify it (this is a fallback and not ideal)
        logger.debug('WARNING: Payload is an object, stringifying it. This is not ideal for signature verification.');
        rawBody = JSON.stringify(payload);
      } else {
        throw new Error(`Unexpected payload type: ${typeof payload}`);
      }
    }
    
    // Log payload snippet for debugging
    if (Buffer.isBuffer(rawBody)) {
      logger.debug('Payload snippet (Buffer):', { value: rawBody.toString('utf8').substring(0, 50) + '...' });
    } else if (typeof rawBody === 'string') {
      logger.debug('Payload snippet (String):', { value: rawBody.substring(0, 50) + '...' });
    }
    
    // Verify and construct the event
    logger.debug('Using webhook secret:', { value: config.stripe.webhookSecret.substring(0, 8) + '...' });
    logger.debug('Signature header:', { value: signature.substring(0, 20) + '...' });
    
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe.webhookSecret
    );
    
    logger.debug('Webhook event successfully verified:', { value: `${event.id}, ${event.type}` });
    
    // Return the event
    return event;
  } catch (error) {
    logger.error('Error in handleWebhookEvent:', { value: error.message });
    if (error.type === 'StripeSignatureVerificationError') {
      logger.error('Webhook signature verification failed');
      logger.error('Expected signature starts with:', { value: error.expected ? error.expected.substring(0, 20) + '...' : 'unknown' });
      logger.error('Received signature starts with:', { value: error.signature ? error.signature.substring(0, 20) + '...' : 'unknown' });
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
    logger.error('Error in getCustomerSubscriptions:', error);
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

// Log final status of Stripe service
logger.debug(`Stripe service export ready, client ${stripe ? 'is initialized' : 'failed to initialize'}`);

export default stripeService; 