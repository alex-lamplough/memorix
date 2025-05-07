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
    
    console.log('Creating checkout session for:', { plan, auth0Id });
    
    // Find user by Auth0 ID
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      console.error('User not found for auth0Id:', auth0Id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Found user:', { 
      id: user._id.toString(),
      email: user.email, 
      hasStripeCustomerId: !!user.stripeCustomerId
    });
    
    // Determine price ID based on plan
    let priceId;
    if (plan === 'pro') {
      priceId = config.stripe.proPlanPriceId;
      console.log('Using Pro plan price ID:', priceId);
    } else {
      console.error('Invalid plan selected:', plan);
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    // Check if we have a valid price ID
    if (!priceId) {
      console.error('Missing price ID in config. Check STRIPE_PRO_PLAN_PRICE_ID env variable.');
      return res.status(500).json({ error: 'Missing price configuration' });
    }
    
    // Create or retrieve Stripe customer
    console.log('Creating or retrieving Stripe customer for user');
    const customer = await stripeService.createOrRetrieveCustomer(user);
    console.log('Customer:', { id: customer.id, isNew: !user.stripeCustomerId });
    
    // If customer was created, save ID to user record
    if (!user.stripeCustomerId) {
      console.log('Updating user with new Stripe customer ID');
      user.stripeCustomerId = customer.id;
      await user.save();
    }
    
    // Create checkout session
    console.log('Creating checkout session with params:', {
      customerId: customer.id,
      priceId,
      successUrl: `${config.server.corsOrigin}/settings?subscription=success`,
      cancelUrl: `${config.server.corsOrigin}/settings?subscription=canceled`
    });
    
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
    
    console.log('Checkout session created successfully:', { sessionId: session.id });
    return res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ error: 'Failed to create checkout session', message: error.message });
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

// Export the webhook handler as a named function
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    console.log('Webhook received, signature:', sig ? 'present' : 'missing');
    
    // Process webhook event
    const event = await stripeService.handleWebhookEvent(req.body, sig);
    console.log('Webhook event processed:', event.type);
    
    // Handle checkout session completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      
      // Get customer ID and metadata from the session
      const { customer, metadata } = session;
      console.log('Session metadata:', metadata);
      
      if (!metadata || !metadata.userId) {
        console.error('Missing userId in checkout session metadata');
        return res.json({ received: true });
      }
      
      // Find user by ID from metadata
      const user = await User.findById(metadata.userId);
      
      if (!user) {
        console.error('User not found for checkout session:', session.id);
        return res.json({ received: true });
      }
      
      console.log(`Updating user ${user.email} subscription to ${metadata.plan}`);
      
      // Update user's subscription information
      user.subscription = {
        plan: metadata.plan,
        status: 'active',
        cancelAtPeriodEnd: false
      };
      
      // Update the Stripe customer ID if not already set
      if (!user.stripeCustomerId) {
        user.stripeCustomerId = customer;
      }
      
      await user.save();
      console.log('User subscription updated successfully');
    }
    
    // Handle subscription events
    if (event.type === 'customer.subscription.created' || 
        event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      console.log('Subscription event:', event.type, subscription.id);
      
      // Find user by customer ID
      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      
      if (!user) {
        console.error('User not found for subscription:', subscription.id);
        return res.json({ received: true });
      }
      
      console.log(`Updating subscription details for user ${user.email}`);
      
      // Update user's subscription information
      user.subscription = {
        stripeSubscriptionId: subscription.id,
        plan: 'pro', // Determine plan based on price ID if you have multiple plans
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      };
      
      await user.save();
      console.log('User subscription updated successfully');
    }
    
    // Handle subscription deletion (cancellation)
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      console.log('Subscription cancelled:', subscription.id);
      
      // Find user by customer ID
      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      
      if (!user) {
        console.error('User not found for subscription:', subscription.id);
        return res.json({ received: true });
      }
      
      console.log(`Cancelling subscription for user ${user.email}`);
      
      // Reset user's subscription to free plan
      user.subscription = {
        plan: 'free',
        status: 'inactive'
      };
      
      await user.save();
      console.log('User subscription cancelled successfully');
    }
    
    return res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    console.error('Error details:', error.message);
    return res.status(400).json({ error: 'Webhook error' });
  }
};

export default router; 