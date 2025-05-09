import { useState } from 'react';
import logger from '../../utils/logger';
import { loadStripe } from '@stripe/stripe-js';
import { useCreateCheckoutSession } from '../../api/queries/subscriptions';

// Initialize Stripe with the publishable key
// This will be loaded from environment variables in a real app
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Button component for initiating Stripe checkout for subscription
 * @param {Object} props - Component props
 * @param {string} props.plan - Plan ID ('pro', 'team', etc.)
 * @param {string} props.text - Button text
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.couponCode - Optional coupon code to apply to checkout
 * @param {Function} props.onClick - Optional callback before redirecting to checkout
 */
const CheckoutButton = ({ 
  plan, 
  text = 'Subscribe', 
  className = '', 
  couponCode = '',
  onClick 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use React Query mutation hook
  const { mutateAsync: createCheckoutSession } = useCreateCheckoutSession();

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call onClick callback if provided (useful for analytics)
      if (onClick && typeof onClick === 'function') {
        onClick();
      }

      // Get checkout session from backend with optional coupon
      const { url } = await createCheckoutSession({ 
        plan, 
        couponCode: couponCode || undefined 
      });
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err) {
      logger.error('Checkout error:', { value: err });
      setError('Failed to start checkout process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Loading...' : text}
      </button>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default CheckoutButton; 