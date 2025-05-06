import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import subscriptionService from '../../services/subscription-service';

// Initialize Stripe with the publishable key
// This will be loaded from environment variables in a real app
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Button component for initiating Stripe checkout for subscription
 * @param {Object} props - Component props
 * @param {string} props.plan - Plan ID ('pro', 'team', etc.)
 * @param {string} props.text - Button text
 * @param {string} props.className - Additional CSS classes
 */
const CheckoutButton = ({ plan, text = 'Subscribe', className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get checkout session from backend
      const { url } = await subscriptionService.createCheckoutSession(plan);
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
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