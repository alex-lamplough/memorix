import User from '../models/user-model.js';
import stripeService from '../services/stripe-service.js';
import { config } from '../config/config.js';

/**
 * Main webhook handler that delegates to specific event handlers
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = config.stripe.webhookSecret;
  
  console.log('-------------------------------------------');
  console.log('🔔 STRIPE WEBHOOK RECEIVED');
  console.log('Endpoint:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Signature:', sig ? 'present' : 'missing');
  console.log('Webhook secret:', webhookSecret ? `${webhookSecret.substring(0, 8)}...` : 'missing');
  
  let event;
  
  // Verify webhook signature and extract the event.
  // If you are testing with the CLI, find the secret by running 'stripe listen'
  if (webhookSecret) {
    try {
      // Verify the event with the webhook secret
      event = stripeService.stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
      console.log(`✅ Webhook signature verified!`);
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // When webhook secret is not configured, we take the event as is (less secure)
    try {
      event = JSON.parse(req.body);
      console.log(`⚠️ Webhook without signature verification - not recommended!`);
    } catch (err) {
      console.log(`⚠️ Webhook JSON parsing failed:`, err.message);
      return res.status(400).send(`Webhook Error: Invalid payload format`);
    }
  }
  
  // Log the event type
  console.log(`Event type: ${event.type}`);
  console.log('-------------------------------------------');
  
  // Extract the object from the event for passing to handlers
  const data = event.data.object;
  
  try {
    // Handle the event based on its type
    switch (event.type) {
      // Customer events
      case 'customer.created':
        await handleCustomerCreated(data);
        break;
      case 'customer.updated':
        await handleCustomerUpdated(data);
        break;
      case 'customer.deleted':
        await handleCustomerDeleted(data);
        break;
        
      // Subscription events
      case 'customer.subscription.created':
        await handleSubscriptionCreated(data, event);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(data, event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(data, event);
        break;
      case 'customer.subscription.trial_will_end':
        await handleSubscriptionTrialWillEnd(data, event);
        break;
        
      // Payment method events
      case 'payment_method.attached':
        await handlePaymentMethodAttached(data);
        break;
      case 'payment_method.detached':
        await handlePaymentMethodDetached(data);
        break;
      case 'payment_method.updated':
        await handlePaymentMethodUpdated(data);
        break;
        
      // Invoice events
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(data);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(data);
        break;
        
      // Checkout events
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(data, event);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    return res.status(200).json({received: true});
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`, err);
    return res.status(200).json({received: true}); // Still return 200 to avoid retries
  }
};

/**
 * Handles customer.created event
 * @param {Object} customer - Stripe customer object
 */
async function handleCustomerCreated(customer) {
  console.log('Customer created:', customer.id);
  
  try {
    // If metadata contains userId, find and update the user
    if (customer.metadata && customer.metadata.userId) {
      const user = await User.findById(customer.metadata.userId);
      
      if (user) {
        // Update user with Stripe customer ID if not already set
        if (!user.stripeCustomerId) {
          user.stripeCustomerId = customer.id;
          
          // Store additional customer data if needed
          user.stripeData = {
            ...user.stripeData,
            customer: {
              id: customer.id,
              created: new Date(customer.created * 1000),
              email: customer.email,
              name: customer.name,
              phone: customer.phone,
              address: customer.address,
              defaultPaymentMethod: customer.invoice_settings?.default_payment_method,
              currency: customer.currency,
              createdAt: new Date()
            }
          };
          
          await user.save();
          console.log(`Updated user ${user.email} with Stripe customer ID`);
        }
      } else {
        console.log(`User not found for customer.created event with ID ${customer.metadata.userId}`);
      }
    } else {
      // Try to find user by email
      const user = await User.findOne({ email: customer.email });
      
      if (user && !user.stripeCustomerId) {
        user.stripeCustomerId = customer.id;
        
        // Store customer data
        user.stripeData = {
          ...user.stripeData,
          customer: {
            id: customer.id,
            created: new Date(customer.created * 1000),
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            defaultPaymentMethod: customer.invoice_settings?.default_payment_method,
            currency: customer.currency,
            createdAt: new Date()
          }
        };
        
        await user.save();
        console.log(`Updated user ${user.email} with Stripe customer ID`);
      }
    }
  } catch (error) {
    console.error('Error handling customer.created event:', error);
  }
}

/**
 * Handles customer.updated event
 * @param {Object} customer - Stripe customer object
 */
async function handleCustomerUpdated(customer) {
  console.log('Customer updated:', customer.id);
  
  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: customer.id });
    
    if (user) {
      // Update customer data in user record
      user.stripeData = {
        ...user.stripeData,
        customer: {
          id: customer.id,
          created: new Date(customer.created * 1000),
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          defaultPaymentMethod: customer.invoice_settings?.default_payment_method,
          currency: customer.currency,
          updatedAt: new Date()
        }
      };
      
      await user.save();
      console.log(`Updated user ${user.email} with latest customer data`);
    } else {
      console.log(`User not found for customer.updated event with ID ${customer.id}`);
    }
  } catch (error) {
    console.error('Error handling customer.updated event:', error);
  }
}

/**
 * Handles customer.deleted event
 * @param {Object} customer - Stripe customer object
 */
async function handleCustomerDeleted(customer) {
  console.log('Customer deleted:', customer.id);
  
  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: customer.id });
    
    if (user) {
      // Mark customer as deleted but keep the ID for reference
      user.stripeData = {
        ...user.stripeData,
        customer: {
          ...user.stripeData?.customer,
          isDeleted: true,
          deletedAt: new Date()
        }
      };
      
      // Reset subscription to free
      user.subscription = {
        plan: 'free',
        status: 'inactive',
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null
      };
      
      await user.save();
      console.log(`Updated user ${user.email} after customer deletion`);
    } else {
      console.log(`User not found for customer.deleted event with ID ${customer.id}`);
    }
  } catch (error) {
    console.error('Error handling customer.deleted event:', error);
  }
}

/**
 * Handles customer.subscription.created event
 * @param {Object} subscription - Stripe subscription object
 * @param {Object} event - Full Stripe event
 */
async function handleSubscriptionCreated(subscription, event) {
  console.log('Subscription created with ID:', subscription.id);
  console.log('Debug - Subscription object contains current_period_end:', subscription.current_period_end);
  
  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    
    if (user) {
      console.log(`Found user ${user.email} for subscription created event`);
      
      // Extract plan information from subscription items
      let planName = 'pro'; // Default to pro
      
      if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
        const item = subscription.items.data[0];
        const priceId = item.price.id;
        
        console.log(`Found price ID: ${priceId} in subscription`);
        
        // Match price ID to plan (fallback to pro)
        if (priceId === config.stripe.proPlanPriceId || !priceId.includes('creator') && !priceId.includes('enterprise')) {
          planName = 'pro';
        } else if (priceId === config.stripe.creatorPlanPriceId || priceId.includes('creator')) {
          planName = 'creator'; 
        } else if (priceId === config.stripe.enterprisePlanPriceId || priceId.includes('enterprise')) {
          planName = 'enterprise';
        }
      }
      
      // Extract billing information - make sure to get the current_period_end from the right place
      let currentPeriodEnd = null;
      if (subscription.current_period_end) {
        currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        console.log('Found current_period_end in subscription:', subscription.current_period_end);
        console.log('Converted to Date object:', currentPeriodEnd);
      } else {
        console.log('WARNING: current_period_end not found in subscription object');
        // Try to find it in other Stripe subscription properties, like the default payment schedule
        if (subscription.items?.data?.[0]?.price?.recurring?.interval_count) {
          const interval = subscription.items.data[0].price.recurring.interval || 'month';
          const intervalCount = subscription.items.data[0].price.recurring.interval_count || 1;
          
          // Calculate a default period end based on current date
          const now = new Date();
          const defaultEnd = new Date(now);
          
          if (interval === 'day') {
            defaultEnd.setDate(defaultEnd.getDate() + intervalCount);
          } else if (interval === 'week') {
            defaultEnd.setDate(defaultEnd.getDate() + (intervalCount * 7));
          } else if (interval === 'month') {
            defaultEnd.setMonth(defaultEnd.getMonth() + intervalCount);
          } else if (interval === 'year') {
            defaultEnd.setFullYear(defaultEnd.getFullYear() + intervalCount);
          }
          
          currentPeriodEnd = defaultEnd;
          console.log('Created default period end based on interval:', currentPeriodEnd);
        }
      }
      
      const amount = subscription.items?.data?.[0]?.price?.unit_amount || 999;
      const currency = subscription.currency || 'gbp';
      const interval = subscription.items?.data?.[0]?.price?.recurring?.interval || 'month';
      
      console.log(`Setting user plan to: ${planName} with period end:`, currentPeriodEnd);
      
      // Update user's subscription information
      user.subscription = {
        plan: planName,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        currentPeriodEnd: currentPeriodEnd,
        stripeSubscriptionId: subscription.id,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        // Add billing info for UI
        amount: amount,
        currency: currency,
        interval: interval,
        // Add a formatted next billing date for easier display
        nextBillingDate: currentPeriodEnd ? currentPeriodEnd.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : null
      };
      
      // Store complete subscription data for reference
      user.stripeData = {
        ...user.stripeData,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : new Date(),
          currentPeriodEnd: currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          amount: amount,
          currency: currency,
          interval: interval,
          items: subscription.items && subscription.items.data ? 
            subscription.items.data.map(item => ({
              id: item.id,
              priceId: item.price.id,
              productId: item.price.product,
              quantity: item.quantity || 1,
              unitAmount: item.price?.unit_amount,
              recurring: item.price?.recurring
            })) : [],
          createdAt: new Date()
        }
      };
      
      console.log('About to save user with updated subscription:', {
        id: user._id,
        email: user.email,
        plan: user.subscription.plan,
        status: user.subscription.status,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        nextBillingDate: user.subscription.nextBillingDate,
        billingInfo: `${amount} ${currency} per ${interval}`
      });
      
      await user.save();
      console.log(`✅ Updated user ${user.email} with subscription plan: ${planName}`);
    } else {
      console.log(`❌ User not found for subscription created event with customer ID ${subscription.customer}`);
    }
  } catch (error) {
    console.error('Error handling subscription.created event:', error);
  }
}

/**
 * Handles customer.subscription.updated event
 * @param {Object} subscription - Stripe subscription object
 */
async function handleSubscriptionUpdated(subscription, event) {
  console.log('Subscription updated:', subscription.id);
  
  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    
    if (user) {
      // Get plan name based on product/price
      const planName = await determinePlanFromSubscription(subscription);
      
      // Get current period end, respecting cancel_at if subscription is being canceled
      const endDate = subscription.cancel_at_period_end ? 
        subscription.cancel_at : 
        subscription.current_period_end;
      
      // Update user's subscription information
      user.subscription = {
        plan: planName,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: endDate ? new Date(endDate * 1000) : null,
        stripeSubscriptionId: subscription.id,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      };
      
      // Store complete subscription data for reference
      user.stripeData = {
        ...user.stripeData,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          items: subscription.items.data.map(item => ({
            id: item.id,
            priceId: item.price.id,
            productId: item.price.product,
            quantity: item.quantity
          })),
          updatedAt: new Date()
        }
      };
      
      await user.save();
      console.log(`Updated user ${user.email} with latest subscription data`);
    } else {
      console.log(`User not found for subscription updated event with customer ID ${subscription.customer}`);
    }
  } catch (error) {
    console.error('Error handling subscription.updated event:', error);
  }
}

/**
 * Handles customer.subscription.deleted event
 * @param {Object} subscription - Stripe subscription object
 */
async function handleSubscriptionDeleted(subscription, event) {
  console.log('Subscription deleted:', subscription.id);
  
  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    
    if (user) {
      // Reset user's subscription to free plan
      user.subscription = {
        plan: 'free',
        status: 'inactive',
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
        stripeSubscriptionId: null
      };
      
      // Mark subscription as deleted in stripeData but keep data for reference
      user.stripeData = {
        ...user.stripeData,
        subscription: {
          ...user.stripeData?.subscription,
          status: 'canceled',
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : new Date(),
          endedAt: new Date(),
          isDeleted: true
        }
      };
      
      await user.save();
      console.log(`Updated user ${user.email} after subscription deletion`);
    } else {
      console.log(`User not found for subscription deleted event with customer ID ${subscription.customer}`);
    }
  } catch (error) {
    console.error('Error handling subscription.deleted event:', error);
  }
}

/**
 * Handles customer.subscription.trial_will_end event
 * @param {Object} subscription - Stripe subscription object
 */
async function handleSubscriptionTrialWillEnd(subscription, event) {
  console.log('Subscription trial will end:', subscription.id);
  
  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    
    if (user) {
      // Update the trial end date
      user.subscription = {
        ...user.subscription,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      };
      
      // Store updated subscription data
      user.stripeData = {
        ...user.stripeData,
        subscription: {
          ...user.stripeData?.subscription,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          updatedAt: new Date()
        }
      };
      
      await user.save();
      console.log(`Updated user ${user.email} with trial end notification`);
      
      // Here you could also trigger an email notification to the user
      // about their trial ending soon
    } else {
      console.log(`User not found for trial will end event with customer ID ${subscription.customer}`);
    }
  } catch (error) {
    console.error('Error handling trial_will_end event:', error);
  }
}

/**
 * Handles payment_method.attached event
 * @param {Object} paymentMethod - Stripe payment method object
 */
async function handlePaymentMethodAttached(paymentMethod) {
  console.log('Payment method attached:', paymentMethod.id);
  
  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: paymentMethod.customer });
    
    if (user) {
      // Store payment method data
      const paymentMethods = user.stripeData?.paymentMethods || [];
      
      // Add new payment method to the array
      paymentMethods.push({
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year
        } : null,
        createdAt: new Date()
      });
      
      // Update user with payment method data
      user.stripeData = {
        ...user.stripeData,
        paymentMethods
      };
      
      await user.save();
      console.log(`Updated user ${user.email} with new payment method`);
    } else {
      console.log(`User not found for payment method attached event with customer ID ${paymentMethod.customer}`);
    }
  } catch (error) {
    console.error('Error handling payment_method.attached event:', error);
  }
}

/**
 * Handles payment_method.detached event
 * @param {Object} paymentMethod - Stripe payment method object
 */
async function handlePaymentMethodDetached(paymentMethod) {
  console.log('Payment method detached:', paymentMethod.id);
  
  try {
    // Since the payment method is detached, the customer ID might not be present
    // We'll need to find the user by payment method ID in our stored data
    const user = await User.findOne({ 'stripeData.paymentMethods.id': paymentMethod.id });
    
    if (user) {
      // Filter out the detached payment method
      const updatedPaymentMethods = (user.stripeData?.paymentMethods || []).map(pm => {
        if (pm.id === paymentMethod.id) {
          return { ...pm, detachedAt: new Date(), isDetached: true };
        }
        return pm;
      });
      
      // Update user with updated payment methods
      user.stripeData = {
        ...user.stripeData,
        paymentMethods: updatedPaymentMethods
      };
      
      await user.save();
      console.log(`Updated user ${user.email} after payment method detached`);
    } else {
      console.log(`User not found for payment method detached event with ID ${paymentMethod.id}`);
    }
  } catch (error) {
    console.error('Error handling payment_method.detached event:', error);
  }
}

/**
 * Handles payment_method.updated event
 * @param {Object} paymentMethod - Stripe payment method object
 */
async function handlePaymentMethodUpdated(paymentMethod) {
  console.log('Payment method updated:', paymentMethod.id);
  
  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: paymentMethod.customer });
    
    if (user) {
      // Update the specific payment method
      const updatedPaymentMethods = (user.stripeData?.paymentMethods || []).map(pm => {
        if (pm.id === paymentMethod.id) {
          return {
            id: paymentMethod.id,
            type: paymentMethod.type,
            card: paymentMethod.card ? {
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
              expMonth: paymentMethod.card.exp_month,
              expYear: paymentMethod.card.exp_year
            } : null,
            createdAt: pm.createdAt,
            updatedAt: new Date()
          };
        }
        return pm;
      });
      
      // Update user with updated payment methods
      user.stripeData = {
        ...user.stripeData,
        paymentMethods: updatedPaymentMethods
      };
      
      await user.save();
      console.log(`Updated user ${user.email} with updated payment method`);
    } else {
      console.log(`User not found for payment method updated event with customer ID ${paymentMethod.customer}`);
    }
  } catch (error) {
    console.error('Error handling payment_method.updated event:', error);
  }
}

/**
 * Handles invoice.payment_succeeded event
 * @param {Object} invoice - Stripe invoice object
 */
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: invoice.customer });
    
    if (user) {
      // Store invoice data
      const invoices = user.stripeData?.invoices || [];
      
      // Add new invoice to the array
      invoices.push({
        id: invoice.id,
        subscriptionId: invoice.subscription,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        paidAt: new Date(invoice.status_transitions.paid_at * 1000),
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000),
        createdAt: new Date()
      });
      
      // Update user with invoice data
      user.stripeData = {
        ...user.stripeData,
        invoices
      };
      
      // If this is a subscription invoice, update the subscription status and next billing date
      if (invoice.subscription && user.subscription?.stripeSubscriptionId === invoice.subscription) {
        // Format the next billing date as a human-readable string
        const nextBillingDate = invoice.period_end
          ? new Date(invoice.period_end * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : null;
        
        console.log('Setting next billing date from invoice:', {
          invoiceId: invoice.id,
          periodEnd: invoice.period_end,
          formattedDate: nextBillingDate
        });
        
        user.subscription = {
          ...user.subscription,
          status: 'active',
          currentPeriodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
          nextBillingDate: nextBillingDate
        };
      }
      
      await user.save();
      console.log(`Updated user ${user.email} with successful payment information`);
    } else {
      console.log(`User not found for invoice payment succeeded event with customer ID ${invoice.customer}`);
    }
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded event:', error);
  }
}

/**
 * Handles invoice.payment_failed event
 * @param {Object} invoice - Stripe invoice object
 */
async function handleInvoicePaymentFailed(invoice) {
  console.log('Invoice payment failed:', invoice.id);
  
  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: invoice.customer });
    
    if (user) {
      // Store invoice data
      const invoices = user.stripeData?.invoices || [];
      
      // Add failed invoice to the array
      invoices.push({
        id: invoice.id,
        subscriptionId: invoice.subscription,
        amountPaid: invoice.amount_paid,
        amountRemaining: invoice.amount_remaining,
        currency: invoice.currency,
        status: invoice.status,
        failureMessage: invoice.last_payment_error?.message,
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000),
        createdAt: new Date()
      });
      
      // Update user with invoice data
      user.stripeData = {
        ...user.stripeData,
        invoices
      };
      
      // If this is a subscription invoice, update the subscription status
      if (invoice.subscription && user.subscription?.stripeSubscriptionId === invoice.subscription) {
        user.subscription = {
          ...user.subscription,
          status: 'past_due'
        };
      }
      
      await user.save();
      console.log(`Updated user ${user.email} with failed payment information`);
      
      // Here you could also trigger an email notification to the user
      // about their payment failing
    } else {
      console.log(`User not found for invoice payment failed event with customer ID ${invoice.customer}`);
    }
  } catch (error) {
    console.error('Error handling invoice.payment_failed event:', error);
  }
}

/**
 * Handles checkout.session.completed event
 * @param {Object} session - Stripe checkout session object
 * @param {Object} event - Full Stripe event
 */
async function handleCheckoutSessionCompleted(session, event) {
  console.log('Checkout session completed:', session.id);
  
  try {
    // Get customer ID and metadata from the session
    const { customer, metadata, subscription: subscriptionId, mode } = session;
    
    // Only proceed if this is a subscription checkout
    if (mode !== 'subscription') {
      console.log('Not a subscription checkout, skipping...');
      return;
    }
    
    console.log('Session metadata:', metadata);
    console.log('Subscription ID from session:', subscriptionId);
    
    if (!customer) {
      console.error('No customer ID found in checkout session');
      return;
    }
    
    // Find user by customer ID 
    let user = await User.findOne({ stripeCustomerId: customer });
    
    // If no user found by customer ID but we have metadata, try to find by ID
    if (!user && metadata && metadata.userId) {
      console.log(`No user found with stripeCustomerId ${customer}, trying userId from metadata: ${metadata.userId}`);
      user = await User.findById(metadata.userId);
      
      // Update user with customer ID if found
      if (user) {
        user.stripeCustomerId = customer;
        await user.save();
        console.log(`Updated user ${user.email} with customer ID ${customer}`);
      }
    }
    
    if (!user) {
      console.error('User not found for checkout session:', session.id);
      return;
    }
    
    // If we have a subscription ID, fetch the subscription details
    if (subscriptionId) {
      try {
        // Get subscription details from Stripe
        const subscription = await stripeService.stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['latest_invoice']
        });
        console.log('Retrieved subscription:', subscription.id);
        console.log('Current period end timestamp:', subscription.current_period_end);
        console.log('Full subscription period info:', {
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end
        });
        
        // Default to Pro plan
        let planName = 'pro';
        
        // Try to determine plan from metadata or subscription
        if (metadata && metadata.plan) {
          planName = metadata.plan;
        } else if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
          const item = subscription.items.data[0];
          const priceId = item.price.id;
          
          // Match based on price ID (with fallbacks)
          if (priceId === config.stripe.proPlanPriceId || !priceId.includes('creator') && !priceId.includes('enterprise')) {
            planName = 'pro';
          } else if (priceId === config.stripe.creatorPlanPriceId || priceId.includes('creator')) {
            planName = 'creator';
          } else if (priceId === config.stripe.enterprisePlanPriceId || priceId.includes('enterprise')) {
            planName = 'enterprise';
          }
        }
        
        // Extract and format the next billing date
        let currentPeriodEnd = null;
        let nextBillingDate = null;
        
        if (subscription.current_period_end) {
          currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          nextBillingDate = currentPeriodEnd.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          console.log('Formatted next billing date:', nextBillingDate);
        } else {
          console.warn('No current_period_end found in subscription, using fallback');
          // Use fallback based on price interval if available
          if (subscription.items?.data?.[0]?.price?.recurring) {
            const interval = subscription.items.data[0].price.recurring.interval || 'month';
            const intervalCount = subscription.items.data[0].price.recurring.interval_count || 1;
            
            // Calculate a default period end based on current date
            const now = new Date();
            currentPeriodEnd = new Date(now);
            
            if (interval === 'day') {
              currentPeriodEnd.setDate(currentPeriodEnd.getDate() + intervalCount);
            } else if (interval === 'week') {
              currentPeriodEnd.setDate(currentPeriodEnd.getDate() + (intervalCount * 7));
            } else if (interval === 'month') {
              currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + intervalCount);
            } else if (interval === 'year') {
              currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + intervalCount);
            }
            
            nextBillingDate = currentPeriodEnd.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            console.log('Created fallback next billing date:', nextBillingDate);
          }
        }
        
        console.log(`Setting user ${user.email} to plan: ${planName} with period end:`, currentPeriodEnd);
        
        // Update user's subscription information with the details
        user.subscription = {
          plan: planName,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          currentPeriodEnd: currentPeriodEnd,
          stripeSubscriptionId: subscription.id,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          // Add details needed for UI
          amount: subscription.latest_invoice?.amount_paid || 999,
          currency: subscription.currency || 'gbp',
          interval: subscription.items?.data[0]?.price?.recurring?.interval || 'month',
          nextBillingDate: nextBillingDate,
          paymentAmount: subscription.latest_invoice?.amount_paid ? 
            new Intl.NumberFormat('en-GB', { 
              style: 'currency', 
              currency: subscription.currency || 'gbp' 
            }).format(subscription.latest_invoice.amount_paid / 100) : '£9.99'
        };
        
        // Store complete subscription data for reference
        user.stripeData = {
          ...user.stripeData,
          subscription: {
            id: subscription.id,
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : new Date(),
            currentPeriodEnd: currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
            cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
            canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
            trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            amount: subscription.latest_invoice?.amount_paid || 999,
            currency: subscription.currency || 'gbp',
            interval: subscription.items?.data[0]?.price?.recurring?.interval || 'month',
            items: subscription.items?.data?.map(item => ({
              id: item.id,
              priceId: item.price.id,
              productId: item.price.product,
              quantity: item.quantity || 1
            })) || [],
            createdAt: new Date(),
            nextBillingDate: nextBillingDate
          }
        };
        
        console.log('About to save user with updated subscription data:', {
          id: user._id,
          email: user.email,
          plan: planName,
          status: subscription.status,
          currentPeriodEnd: currentPeriodEnd,
          nextBillingDate: nextBillingDate
        });
        
      } catch (error) {
        console.error('Error retrieving subscription details:', error);
      }
    }
    
    await user.save();
    console.log(`Updated user ${user.email} with latest customer data`);
  } catch (error) {
    console.error('Error handling checkout.session.completed event:', error);
  }
}

/**
 * Helper to determine plan name from subscription
 * @param {Object} subscription - Stripe subscription object
 * @returns {Promise<string>} Plan name ('pro', 'creator', etc.)
 */
async function determinePlanFromSubscription(subscription) {
  try {
    console.log('Determining plan from subscription items:', 
      subscription.items.data.map(item => ({
        priceId: item.price.id,
        productId: item.price.product
      }))
    );
    
    // Default to 'pro' plan if we can't determine
    let planName = 'pro';
    
    // Get first subscription item (most subscriptions have just one)
    const item = subscription.items.data[0];
    
    if (item) {
      const priceId = item.price.id;
      console.log(`Matching price ID ${priceId} to known plan price IDs:`, {
        proPlanPriceId: config.stripe.proPlanPriceId,
        creatorPlanPriceId: config.stripe.creatorPlanPriceId,
        enterprisePlanPriceId: config.stripe.enterprisePlanPriceId
      });
      
      // Match price ID to plan
      if (priceId === config.stripe.proPlanPriceId) {
        planName = 'pro';
      } else if (priceId === config.stripe.creatorPlanPriceId) {
        planName = 'creator';
      } else if (priceId === config.stripe.enterprisePlanPriceId) {
        planName = 'enterprise';
      }
      
      console.log(`Determined plan: ${planName} from price ID: ${priceId}`);
    }
    
    return planName;
  } catch (error) {
    console.error('Error determining plan from subscription:', error);
    return 'pro'; // Default fallback
  }
}

export default handleStripeWebhook; 