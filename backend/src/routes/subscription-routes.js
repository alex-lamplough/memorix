import express from 'express';
import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { config } from '../config/config.js';
import stripeService from '../services/stripe-service.js';
import User from '../models/user-model.js'; // Adjust import based on your user model
import { checkJwt } from '../middleware/auth-middleware.js';
import * as subscriptionController from '../controllers/subscription-controller.js';

const router = express.Router();

// Apply JWT auth to all routes in this router
router.use(checkJwt);

// Get current user's subscription info
router.get('/current', async (req, res) => {
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
    
    // Format the renewal date (current period end) for frontend display
    let renewalDateFormatted = null;
    if (subscription.current_period_end) {
      const renewalDate = new Date(subscription.current_period_end * 1000);
      renewalDateFormatted = renewalDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return res.json({
      status: subscription.status,
      plan: user.subscription.plan,
      renewalDate: renewalDateFormatted,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription information' });
  }
});

// Get subscription details and billing information
router.get('/details', async (req, res) => {
  try {
    const userId = req.auth.sub;
    
    // Find the user with the auth0 ID
    const user = await User.findOne({ auth0Id: userId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format next billing date for display
    let nextBillingDate = null;
    if (user.subscription?.currentPeriodEnd) {
      nextBillingDate = user.subscription.currentPeriodEnd.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    }
    
    // Refresh from Stripe if we have a subscription ID
    if (user.subscription?.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripeService.getSubscription(user.subscription.stripeSubscriptionId);
        if (stripeSubscription?.current_period_end) {
          const renewalDate = new Date(stripeSubscription.current_period_end * 1000);
          nextBillingDate = renewalDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      } catch (stripeError) {
        console.error('Error fetching latest subscription from Stripe:', stripeError);
        // Continue with the stored data if Stripe fetch fails
      }
    }
    
    // Construct subscription details for UI display
    const subscriptionDetails = {
      plan: user.subscription?.plan || 'free',
      status: user.subscription?.status || 'inactive',
      cancelAtPeriodEnd: user.subscription?.cancelAtPeriodEnd || false,
      currentPeriodEnd: user.subscription?.currentPeriodEnd || null,
      nextBillingDate: nextBillingDate,
      // Billing information 
      amount: user.subscription?.amount || 0,
      currency: user.subscription?.currency || 'gbp',
      interval: user.subscription?.interval || 'month',
      formattedAmount: user.subscription?.amount ? 
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: user.subscription?.currency || 'gbp',
          minimumFractionDigits: 2
        }).format(user.subscription.amount / 100) : null,
      // Payment methods (first card)
      paymentMethod: user.stripeData?.paymentMethods?.[0] ? {
        type: user.stripeData.paymentMethods[0].type,
        card: user.stripeData.paymentMethods[0].card ? {
          brand: user.stripeData.paymentMethods[0].card.brand,
          last4: user.stripeData.paymentMethods[0].card.last4,
          expMonth: user.stripeData.paymentMethods[0].card.expMonth,
          expYear: user.stripeData.paymentMethods[0].card.expYear,
        } : null
      } : null,
      // Latest invoice
      latestInvoice: user.stripeData?.invoices?.[0] ? {
        id: user.stripeData.invoices[0].id,
        amount: user.stripeData.invoices[0].amountPaid,
        currency: user.stripeData.invoices[0].currency,
        status: user.stripeData.invoices[0].status,
        date: user.stripeData.invoices[0].createdAt
      } : null
    };
    
    return res.status(200).json(subscriptionDetails);
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a checkout session for a subscription
router.post('/create-checkout-session', subscriptionController.createCheckoutSession);

// Create a portal session for managing subscription
router.post('/create-portal-session', subscriptionController.createPortalSession);

// Validate a coupon code
router.post('/validate-coupon', subscriptionController.validateCoupon);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// Resume canceled subscription
router.post('/resume', subscriptionController.resumeSubscription);

// Upgrade subscription
router.post('/upgrade', subscriptionController.upgradeSubscription);

// Downgrade subscription
router.post('/downgrade', subscriptionController.downgradeSubscription);

export default router; 