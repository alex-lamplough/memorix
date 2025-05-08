import { useState, useEffect } from 'react';
import logger from '../../../utils/logger';
import { loadStripe } from '@stripe/stripe-js';
import subscriptionService from '../../services/subscription-service';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Comprehensive Stripe widget for managing subscriptions
 * 
 * @param {Object} props
 * @param {Object} props.user - Current user object
 * @param {Object} props.subscription - Current subscription object
 * @param {Function} props.onSubscriptionUpdate - Callback when subscription changes
 * @param {string} props.className - Additional CSS classes
 */
const StripeWidget = ({ user, subscription, onSubscriptionUpdate, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  
  useEffect(() => {
    // If we have a subscription, set it to the details state
    if (subscription) {
      setSubscriptionDetails(subscription);
    }
  }, [subscription]);
  
  // Function to handle checkout for new subscription
  const handleSubscribe = async (plan) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedPlan(plan);

      // Get checkout session from backend
      const { url } = await subscriptionService.createCheckoutSession(plan);
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err) {
      logger.error('Checkout error:', { value: err });
      setError('Failed to start checkout process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to open Stripe portal for managing existing subscription
  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get portal session from backend
      const { url } = await subscriptionService.createPortalSession();
      
      // Redirect to Stripe portal
      window.location.href = url;
    } catch (err) {
      logger.error('Portal error:', { value: err });
      setError('Failed to open subscription management. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to cancel subscription at period end
  const handleCancelSubscription = async () => {
    try {
      if (!window.confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
        return;
      }
      
      setIsLoading(true);
      setError(null);

      // Call cancel endpoint
      const result = await subscriptionService.cancelSubscription();
      
      // Update local state
      setSubscriptionDetails({
        ...subscriptionDetails,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: result.currentPeriodEnd
      });
      
      // Notify parent component
      if (onSubscriptionUpdate) {
        onSubscriptionUpdate({
          ...subscriptionDetails,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: result.currentPeriodEnd
        });
      }
    } catch (err) {
      logger.error('Cancellation error:', { value: err });
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to reactivate a subscription that was scheduled for cancellation
  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call reactivate endpoint
      const result = await subscriptionService.reactivateSubscription();
      
      // Update local state
      setSubscriptionDetails({
        ...subscriptionDetails,
        cancelAtPeriodEnd: false
      });
      
      // Notify parent component
      if (onSubscriptionUpdate) {
        onSubscriptionUpdate({
          ...subscriptionDetails,
          cancelAtPeriodEnd: false
        });
      }
    } catch (err) {
      logger.error('Reactivation error:', { value: err });
      setError('Failed to reactivate subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderSubscriptionDetails = () => {
    if (!subscriptionDetails) {
      return (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p>You are currently on the <strong>Free Plan</strong>.</p>
          <p className="text-sm text-gray-600 mt-2">
            Upgrade to access more features and support the platform.
          </p>
        </div>
      );
    }
    
    const {
      plan,
      status,
      renewalDate,
      cancelAtPeriodEnd
    } = subscriptionDetails;
    
    const formattedRenewalDate = renewalDate 
      ? new Date(renewalDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) 
      : 'N/A';
    
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg">Current Subscription</h3>
        <div className="mt-2 space-y-1">
          <p>
            <span className="text-gray-600">Plan:</span> {' '}
            <span className="font-medium capitalize">{plan}</span>
          </p>
          <p>
            <span className="text-gray-600">Status:</span> {' '}
            <span className={`font-medium ${status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
              {status === 'active' ? 'Active' : status === 'trialing' ? 'Trial' : 'Inactive'}
            </span>
          </p>
          {renewalDate && (
            <p>
              <span className="text-gray-600">
                {cancelAtPeriodEnd ? 'Ends on:' : 'Renews on:'}
              </span> {' '}
              <span className="font-medium">{formattedRenewalDate}</span>
            </p>
          )}
          {cancelAtPeriodEnd && (
            <p className="text-sm text-orange-600 mt-2">
              Your subscription is scheduled to be canceled at the end of the current billing period.
            </p>
          )}
        </div>
      </div>
    );
  };
  
  const renderSubscribeSection = () => {
    if (subscriptionDetails && subscriptionDetails.plan !== 'free' && subscriptionDetails.status === 'active') {
      return (
        <div className="space-y-4">
          <button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Manage Subscription in Stripe Portal'}
          </button>
          
          {subscriptionDetails.cancelAtPeriodEnd ? (
            <button
              onClick={handleReactivateSubscription}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Reactivate Subscription'}
            </button>
          ) : (
            <button
              onClick={handleCancelSubscription}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-white hover:bg-gray-50 text-red-600 border border-red-600 font-medium rounded-md transition duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Cancel Subscription'}
            </button>
          )}
        </div>
      );
    }
    
    // Render subscription options
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-indigo-600"
                checked={selectedPlan === 'pro'}
                onChange={() => setSelectedPlan('pro')}
              />
              <span className="ml-2 text-gray-700">Pro Plan</span>
            </label>
            <p className="text-sm text-gray-500 ml-7">£7.99/month</p>
          </div>
          <div className="flex-1">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-indigo-600"
                checked={selectedPlan === 'creator'}
                onChange={() => setSelectedPlan('creator')}
              />
              <span className="ml-2 text-gray-700">Creator Plan</span>
            </label>
            <p className="text-sm text-gray-500 ml-7">£17.99/month</p>
          </div>
        </div>
        
        <button
          onClick={() => handleSubscribe(selectedPlan)}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : `Subscribe to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan`}
        </button>
      </div>
    );
  };
  
  return (
    <div className={`stripe-widget ${className}`}>
      {renderSubscriptionDetails()}
      {renderSubscribeSection()}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default StripeWidget; 