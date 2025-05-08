import { useState } from 'react';
import subscriptionService from '../../services/subscription-service';
import { useNavigate } from 'react-router-dom';

/**
 * Button component for opening Stripe customer portal to manage subscription
 * @param {Object} props - Component props
 * @param {string} props.text - Button text
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onError - Callback function when error occurs
 */
const ManageSubscriptionButton = ({ 
  text = 'Manage Subscription', 
  className = '',
  onError = null
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      
      // Check if this is a Stripe configuration error
      const errorMessage = err.response?.data?.message || err.message || '';
      const errorCode = err.response?.data?.code;
      
      if (errorCode === 'PORTAL_CONFIGURATION_MISSING' || 
          errorMessage.includes('configuration') || 
          errorMessage.includes('portal settings')) {
        const configError = 'Stripe customer portal is not yet configured. Please contact support.';
        setError(configError);
        
        // Call the onError callback if provided
        if (onError && typeof onError === 'function') {
          onError(configError, errorCode);
        }
        
        // As a fallback, stay on the subscription tab
        setTimeout(() => {
          navigate('/settings?tab=subscription');
        }, 2000);
      } else {
        const genericError = 'Failed to open subscription management. Please try again.';
        setError(genericError);
        
        // Call the onError callback if provided
        if (onError && typeof onError === 'function') {
          onError(genericError);
        }
      }
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
      {error && (
        <p className="text-sm text-amber-400 mt-2 p-2 bg-gray-800/30 rounded">
          {error}
        </p>
      )}
    </div>
  );
};

export default ManageSubscriptionButton; 