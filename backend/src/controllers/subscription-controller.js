import stripeService from '../services/stripe-service.js';
import logger from '../utils/logger.js';
import User from '../models/user-model.js';
import { config } from '../config/config.js';

/**
 * Create a checkout session for subscription purchase
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { plan, couponCode } = req.body;
    const auth0Id = req.auth.sub;
    
    logger.debug('Creating checkout session for:', { plan, auth0Id, hasCoupon: !!couponCode });
    
    // Validate plan input
    if (!plan || !['pro', 'creator', 'enterprise'].includes(plan)) {
      logger.error('Invalid plan selected:', { value: plan });
      return res.status(400).json({ 
        error: 'Invalid plan selected',
        message: 'The selected subscription plan is not valid' 
      });
    }
    
    // Find user by Auth0 ID
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      logger.error('User not found for auth0Id:', { value: auth0Id });
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.debug('Found user:', { 
      id: user._id.toString(),
      email: user.email, 
      hasStripeCustomerId: !!user.stripeCustomerId
    });
    
    // Determine price ID based on plan
    let priceId;
    if (plan === 'pro') {
      priceId = config.stripe.proPlanPriceId;
      logger.debug('Using Pro plan price ID:', { value: priceId });
    } else if (plan === 'creator') {
      priceId = config.stripe.creatorPlanPriceId;
      logger.debug('Using Creator plan price ID:', { value: priceId });
    } else if (plan === 'enterprise') {
      priceId = config.stripe.enterprisePlanPriceId;
      logger.debug('Using Enterprise plan price ID:', { value: priceId });
    } else {
      logger.error('Invalid plan selected:', { value: plan });
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    // Check if we have a valid price ID
    if (!priceId) {
      logger.error('Missing price ID in config. Check env variable for the selected plan.');
      logger.error(`Config has proPlanPriceId: ${!!config.stripe.proPlanPriceId}, creatorPlanPriceId: ${!!config.stripe.creatorPlanPriceId}`);
      return res.status(500).json({ 
        error: 'Missing price configuration',
        message: 'The subscription plan is not configured correctly. Please contact support.'
      });
    }
    
    // Create or retrieve Stripe customer
    try {
      logger.debug('Creating or retrieving Stripe customer for user');
      const customer = await stripeService.createOrRetrieveCustomer(user);
      logger.debug('Customer:', { id: customer.id, isNew: !user.stripeCustomerId });
      
      // If customer was created, save ID to user record
      if (!user.stripeCustomerId) {
        logger.debug('Updating user with new Stripe customer ID');
        user.stripeCustomerId = customer.id;
        await user.save();
      }
      
      // Create session options
      const sessionOptions = {
        customerId: customer.id,
        priceId,
        successUrl: `${config.server.corsOrigin}/settings?subscription=success`,
        cancelUrl: `${config.server.corsOrigin}/settings?subscription=canceled`,
        metadata: {
          userId: user._id.toString(),
          plan
        }
      };
      
      // Add coupon code if provided
      if (couponCode && couponCode.trim()) {
        sessionOptions.couponCode = couponCode.trim();
        logger.debug('Applying coupon code to checkout session:', { value: couponCode.trim() });
      }
      
      logger.debug('Creating checkout session with params:', {
        customerId: customer.id,
        priceId,
        successUrl: `${config.server.corsOrigin}/settings?subscription=success`,
        cancelUrl: `${config.server.corsOrigin}/settings?subscription=canceled`,
        hasCoupon: !!sessionOptions.couponCode
      });
      
      const session = await stripeService.createCheckoutSession(sessionOptions);
      
      logger.debug('Checkout session created successfully:', { sessionId: session.id });
      return res.json({ sessionId: session.id, url: session.url });
    } catch (stripeError) {
      logger.error('Stripe error in checkout session creation:', stripeError.message);
      console.error(stripeError);
      
      // Handle specific Stripe errors
      if (stripeError.type === 'StripeInvalidRequestError') {
        if (stripeError.param === 'coupon') {
          return res.status(400).json({ 
            error: 'Invalid coupon code',
            message: 'The coupon code provided is invalid or has expired'
          });
        } else if (stripeError.message.includes('price')) {
          return res.status(400).json({ 
            error: 'Invalid price configuration',
            message: 'The subscription price is not configured correctly'
          });
        }
      }
      
      // Generic Stripe error
      return res.status(400).json({ 
        error: 'Payment processing error',
        message: 'There was an issue setting up your payment. Please try again later.',
        code: stripeError.code || stripeError.type || 'unknown_error'
      });
    }
  } catch (error) {
    logger.error('Unexpected error creating checkout session:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session', 
      message: 'An unexpected error occurred while setting up your payment. Please try again later.'
    });
  }
};

/**
 * Create a portal session for managing subscription
 */
export const createPortalSession = async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    
    // Find user by Auth0 ID
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription to manage' });
    }
    
    // Create portal session
    try {
      const session = await stripeService.createPortalSession(
        user.stripeCustomerId,
        `${config.server.corsOrigin}/settings`
      );
      
      return res.json({ url: session.url });
    } catch (stripeError) {
      logger.error('Stripe error creating portal session:', stripeError);
      
      // Check for specific Stripe errors related to configuration
      if (stripeError.type === 'StripeInvalidRequestError') {
        if (stripeError.message && stripeError.message.includes('configuration')) {
          return res.status(503).json({ 
            error: 'Service Unavailable',
            message: 'Stripe customer portal is not configured. Please go to Stripe dashboard to set up portal configuration.',
            code: 'PORTAL_CONFIGURATION_MISSING'
          });
        }
      }
      
      // Generic error fallback
      throw stripeError;
    }
  } catch (error) {
    logger.error('Error creating portal session:', error);
    return res.status(500).json({ 
      error: 'Failed to create portal session',
      message: error.message
    });
  }
};

/**
 * Cancel subscription at the end of the billing period
 */
export const cancelSubscription = async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    
    // Find user by Auth0 ID
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.subscription || !user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription to cancel' });
    }
    
    // Cancel subscription at period end
    const subscription = await stripeService.updateSubscription(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );
    
    // Update user record
    user.subscription.cancelAtPeriodEnd = true;
    await user.save();
    
    return res.json({ 
      message: 'Subscription will be canceled at the end of the billing period',
      cancelAtPeriodEnd: true,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });
  } catch (error) {
    logger.error('Error canceling subscription:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

/**
 * Resume a subscription that was canceled but still active
 */
export const resumeSubscription = async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    
    // Find user by Auth0 ID
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.subscription || !user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No subscription to resume' });
    }
    
    if (!user.subscription.cancelAtPeriodEnd) {
      return res.status(400).json({ error: 'Subscription is not scheduled for cancellation' });
    }
    
    // Reactivate subscription
    const subscription = await stripeService.updateSubscription(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );
    
    // Update user record
    user.subscription.cancelAtPeriodEnd = false;
    await user.save();
    
    return res.json({ 
      message: 'Subscription resumed successfully',
      cancelAtPeriodEnd: false,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });
  } catch (error) {
    logger.error('Error resuming subscription:', error);
    return res.status(500).json({ error: 'Failed to resume subscription' });
  }
};

/**
 * Upgrade from a lower tier plan to a higher tier
 */
export const upgradeSubscription = async (req, res) => {
  try {
    const { newPlan } = req.body;
    const auth0Id = req.auth.sub;
    
    // Find user by Auth0 ID
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.subscription || !user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription to upgrade' });
    }
    
    // Validate plan upgrade path
    const currentPlan = user.subscription.plan;
    if (
      (currentPlan === 'pro' && newPlan === 'free') ||
      (currentPlan === 'creator' && (newPlan === 'free' || newPlan === 'pro')) ||
      (currentPlan === 'enterprise')
    ) {
      return res.status(400).json({ error: 'Invalid upgrade path. Please use downgrade endpoint for downgrades.' });
    }
    
    // Get new price ID
    let newPriceId;
    if (newPlan === 'pro') {
      newPriceId = config.stripe.proPlanPriceId;
    } else if (newPlan === 'creator') {
      newPriceId = config.stripe.creatorPlanPriceId;
    } else if (newPlan === 'enterprise') {
      newPriceId = config.stripe.enterprisePlanPriceId;
    } else {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    // Update subscription
    const updatedSubscription = await stripeService.updateSubscription(
      user.subscription.stripeSubscriptionId,
      { 
        proration_behavior: 'create_prorations',
        items: [{
          id: user.stripeData.subscription.items[0].id,
          price: newPriceId,
        }]
      }
    );
    
    // Create a portal session for the user to review changes
    const portalSession = await stripeService.createPortalSession(
      user.stripeCustomerId,
      `${config.server.corsOrigin}/settings?upgrade=success`
    );
    
    return res.json({ 
      message: 'Subscription upgraded successfully',
      portalUrl: portalSession.url
    });
  } catch (error) {
    logger.error('Error upgrading subscription:', error);
    return res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
};

/**
 * Downgrade from a higher tier plan to a lower tier
 */
export const downgradeSubscription = async (req, res) => {
  try {
    const { newPlan } = req.body;
    const auth0Id = req.auth.sub;
    
    // Find user by Auth0 ID
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.subscription || !user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription to downgrade' });
    }
    
    // Validate plan downgrade path
    const currentPlan = user.subscription.plan;
    if (
      (currentPlan === 'free') ||
      (currentPlan === 'pro' && newPlan === 'creator') ||
      (currentPlan === 'creator' && newPlan === 'enterprise')
    ) {
      return res.status(400).json({ error: 'Invalid downgrade path' });
    }
    
    // Get new price ID
    let newPriceId;
    if (newPlan === 'free') {
      // For free plan, we just cancel the subscription
      return await cancelSubscription(req, res);
    } else if (newPlan === 'pro') {
      newPriceId = config.stripe.proPlanPriceId;
    } else if (newPlan === 'creator') {
      newPriceId = config.stripe.creatorPlanPriceId;
    } else {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    // Update subscription (will take effect at end of billing period)
    const updatedSubscription = await stripeService.updateSubscription(
      user.subscription.stripeSubscriptionId,
      { 
        proration_behavior: 'none',
        items: [{
          id: user.stripeData.subscription.items[0].id,
          price: newPriceId,
        }]
      }
    );
    
    // Create a portal session for the user to review changes
    const portalSession = await stripeService.createPortalSession(
      user.stripeCustomerId,
      `${config.server.corsOrigin}/settings?downgrade=success`
    );
    
    return res.json({ 
      message: 'Subscription will be downgraded at the end of the current billing period',
      portalUrl: portalSession.url
    });
  } catch (error) {
    logger.error('Error downgrading subscription:', error);
    return res.status(500).json({ error: 'Failed to downgrade subscription' });
  }
};

/**
 * Validate a coupon code with Stripe
 */
export const validateCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    
    if (!couponCode || !couponCode.trim()) {
      return res.status(400).json({ 
        valid: false, 
        message: 'No coupon code provided' 
      });
    }
    
    logger.debug('Validating coupon code:', { value: couponCode });
    
    try {
      // Retrieve the coupon from Stripe
      const coupon = await stripeService.stripe.coupons.retrieve(couponCode.trim());
      
      // Check if the coupon is valid (not expired, etc.)
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const isExpired = coupon.redeem_by && coupon.redeem_by < now;
      
      if (isExpired) {
        return res.status(400).json({
          valid: false,
          message: 'This coupon has expired'
        });
      }
      
      if (!coupon.valid) {
        return res.status(400).json({
          valid: false,
          message: 'This coupon is no longer valid'
        });
      }
      
      // Calculate the discount amount for display purposes
      const regularPrice = 7.99; // Default price for Pro plan
      let discountedPrice = regularPrice;
      let discountDisplay = '';
      
      if (coupon.percent_off) {
        discountedPrice = regularPrice * (1 - coupon.percent_off / 100);
        discountDisplay = `${coupon.percent_off}% off`;
      } else if (coupon.amount_off) {
        // amount_off is in cents, convert to dollars
        const amountOff = coupon.amount_off / 100;
        discountedPrice = Math.max(0, regularPrice - amountOff);
        discountDisplay = `£${amountOff.toFixed(2)} off`;
      }
      
      // Format for display
      discountedPrice = Math.max(0, discountedPrice).toFixed(2);
      
      return res.json({
        valid: true,
        id: coupon.id,
        name: coupon.name || coupon.id,
        discountedPrice,
        regularPrice: regularPrice.toFixed(2),
        discountDisplay,
        message: `Coupon applied: ${discountDisplay}`
      });
    } catch (error) {
      logger.error('Error retrieving coupon from Stripe:', error);
      
      // Check if it's a "coupon not found" error
      if (error.type === 'StripeInvalidRequestError' && error.message.includes('No such coupon')) {
        return res.status(404).json({
          valid: false,
          message: 'Invalid coupon code'
        });
      }
      
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    logger.error('Error validating coupon:', error);
    return res.status(500).json({ 
      valid: false, 
      message: 'Failed to validate coupon',
      error: error.message
    });
  }
}; 