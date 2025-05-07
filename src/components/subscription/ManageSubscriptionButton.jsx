import { useState } from 'react';
import subscriptionService from '../../services/subscription-service';

/**
 * Button component for opening Stripe customer portal to manage subscription
 * @param {Object} props - Component props
 * @param {string} props.text - Button text
 * @param {string} props.className - Additional CSS classes
 */
const ManageSubscriptionButton = ({ text = 'Manage Subscription', className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get portal session from backend
      const { url } = await subscriptionService.createPortalSession();
      
      // Redirect to Stripe customer portal
      window.location.href = url;
    } catch (err) {
      console.error('Portal error:', err);
      setError('Failed to open subscription management. Please try again.');
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

export default ManageSubscriptionButton; 