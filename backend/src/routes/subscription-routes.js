import express from 'express';
import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { config } from '../config/config.js';
import stripeService from '../services/stripe-service.js';
import User from '../models/user-model.js'; // Adjust import based on your user model

const router = express.Router();

// Auth0 JWT middleware
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${config.auth0.domain}/.well-known/jwks.json`
  }),
  audience: config.auth0.audience,
  issuer: `https://${config.auth0.domain}/`,
  algorithms: ['RS256']
});

// Get current user's subscription info
router.get('/current', checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    
    // Find user by Auth0 ID
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If user has no subscription, return free plan
    if (!user.subscription || !user.subscription.stripeSubscriptionId) {
      return res.json({
        status: 'active',
        plan: 'free',
        renewalDate: null
      });
    }
    
    // Get subscription details from Stripe
    const subscription = await stripeService.getSubscription(user.subscription.stripeSubscriptionId);
    
    return res.json({
      status: subscription.status,
      plan: user.subscription.plan,
      renewalDate: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription information' });
  }
});

// Create a checkout session for a subscription
router.post('/create-checkout-session', checkJwt, async (req, res) => {
  try {
    const { plan } = req.body;
    const auth0Id = req.auth.sub;
    
    // Find user by Auth0 ID
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Determine price ID based on plan
    let priceId;
    if (plan === 'pro') {
      priceId = config.stripe.proPlanPriceId;
    } else {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    // Create or retrieve Stripe customer
    const customer = await stripeService.createOrRetrieveCustomer(user);
    
    // If customer was created, save ID to user record
    if (!user.stripeCustomerId) {
      user.stripeCustomerId = customer.id;
      await user.save();
    }
    
    // Create checkout session
    const session = await stripeService.createCheckoutSession({
      customerId: customer.id,
      priceId,
      successUrl: `${config.server.corsOrigin}/settings?subscription=success`,
      cancelUrl: `${config.server.corsOrigin}/settings?subscription=canceled`,
      metadata: {
        userId: user._id.toString(),
        plan
      }
    });
    
    return res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create a portal session for managing subscription
router.post('/create-portal-session', checkJwt, async (req, res) => {
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
    const session = await stripeService.createPortalSession(
      user.stripeCustomerId,
      `${config.server.corsOrigin}/settings`
    );
    
    return res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Handle Stripe webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    // Process webhook event
    const event = await stripeService.handleWebhookEvent(req.body, sig);
    
    // Handle subscription events
    if (event.type === 'customer.subscription.created' || 
        event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      
      // Find user by customer ID
      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      
      if (!user) {
        console.error('User not found for subscription:', subscription.id);
        return res.status(400).json({ received: true });
      }
      
      // Update user's subscription information
      user.subscription = {
        stripeSubscriptionId: subscription.id,
        plan: 'pro', // Determine plan based on price ID if you have multiple plans
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      };
      
      await user.save();
    }
    
    // Handle subscription deletion (cancellation)
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      
      // Find user by customer ID
      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      
      if (!user) {
        console.error('User not found for subscription:', subscription.id);
        return res.status(400).json({ received: true });
      }
      
      // Reset user's subscription to free plan
      user.subscription = {
        plan: 'free',
        status: 'inactive'
      };
      
      await user.save();
    }
    
    return res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(400).json({ error: 'Webhook error' });
  }
});

export default router; 