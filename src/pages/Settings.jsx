import { useState, useEffect } from 'react'
import logger from '../utils/logger';
import { useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import { Link, useLocation, useNavigate } from 'react-router-dom'

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import Layout from '../components/Layout'
import ManageSubscriptionButton from '../components/subscription/ManageSubscriptionButton'
import CheckoutButton from '../components/subscription/CheckoutButton'

// Icons
import NotificationsIcon from '@mui/icons-material/Notifications'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import HelpIcon from '@mui/icons-material/Help'
import CheckIcon from '@mui/icons-material/Check'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import EmailIcon from '@mui/icons-material/Email'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import PercentIcon from '@mui/icons-material/Percent'

// Hooks and Services
import { useUserProfile, useUpdateUserProfile, useUpdateUserPreferences } from '../api/queries/users'
import useSubscription from '../hooks/useSubscription'
import { 
  useCreatePortalSession, 
  useCreateCheckoutSession, 
  useValidateCoupon 
} from '../api/queries/subscriptions'

function SettingsNavItem({ icon, label, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${active ? 'bg-[#00ff94]/10 text-[#00ff94]' : 'text-white/70 hover:bg-white/5'} cursor-pointer transition-colors`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff94]"></div>}
    </div>
  )
}

function SettingsNav({ activeSection, setActiveSection }) {
  const sections = [
    { id: 'account', label: 'Account', icon: <AccountCircleIcon fontSize="small" /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCardIcon fontSize="small" /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon fontSize="small" /> },
    { id: 'help', label: 'Help & Support', icon: <HelpIcon fontSize="small" /> },
  ];
  
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-4 border border-gray-800/30 shadow-lg text-white">
      <h3 className="text-lg font-bold px-4 py-2 mb-2">Settings</h3>
      <div className="space-y-1">
        {sections.map((section) => (
          <SettingsNavItem 
            key={section.id}
            icon={section.icon}
            label={section.label}
            active={activeSection === section.id}
            onClick={() => setActiveSection(section.id)}
          />
        ))}
      </div>
    </div>
  );
}

function AccountSettings({ setActiveSection }) {
  // Get user profile data and update mutation
  const { data: user, isLoading: isLoadingUser } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const location = useLocation();
  const { subscription, isLoading: isLoadingSubscription, isProSubscriber } = useSubscription();
  
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  // Check for subscription status in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subscriptionStatus = params.get('subscription');
    
    if (subscriptionStatus === 'success') {
      setSubscriptionMessage('Your subscription was successfully activated!');
      // Clear the URL parameter after showing the message
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 5000);
    } else if (subscriptionStatus === 'canceled') {
      setSubscriptionMessage('Your subscription checkout was canceled.');
      // Clear the URL parameter after showing the message
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 5000);
    }
  }, [location.search]);

  // Initialize display name when user data is loaded
  useEffect(() => {
    if (user) {
      logger.debug('Loading user profile:', { value: user });
      // Prioritize profile.displayName, fallback to name if not available
      setDisplayName(user.profile?.displayName || user.name || '');
    }
  }, [user]);

  // Debug logging when display name changes
  useEffect(() => {
    logger.debug('Current display name state:', { value: displayName });
  }, [displayName]);

  const handleSaveChanges = async () => {
    if (!displayName.trim()) {
      // Prevent saving empty display name
      return;
    }
    
    setIsSaving(true);
    try {
      logger.debug('Saving profile update:', { profile: { displayName } });
      await updateProfile.mutateAsync({ 
        profile: { displayName },
        // Also update the name field for backwards compatibility
        name: displayName
      });
      // Success is handled by the mutation
    } catch (error) {
      logger.error('Error saving profile changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingUser || isLoadingSubscription) {
    return (
      <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
        <p className="text-white/70">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <h2 className="text-xl font-bold mb-6">Account Settings</h2>
      
      {subscriptionMessage && (
        <div className="bg-[#00ff94]/10 border border-[#00ff94]/30 text-[#00ff94] p-4 rounded-lg mb-6">
          {subscriptionMessage}
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#a259ff]/20 rounded-full flex items-center justify-center">
            <AccountCircleIcon style={{ fontSize: '2rem' }} className="text-[#a259ff]" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{user?.profile?.displayName || displayName}</h3>
            <p className="text-white/70 text-sm">
              {user.subscription?.plan
                ? user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1) + ' Plan'
                : 'Free Plan'}
            </p>
          </div>
          {!isProSubscriber() && (
            <button
              onClick={() => setActiveSection('subscription')}
              className="sm:ml-auto bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
            >
              Upgrade Plan
            </button>
          )}
          {isProSubscriber() && (
            <button
              onClick={() => setActiveSection('subscription')}
              className="sm:ml-auto bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
            >
              Manage Subscription
            </button>
          )}
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-white/70 text-sm mb-2">Email</label>
            <div className="flex items-center w-full bg-[#18092a]/80 text-white/80 rounded-lg px-4 py-3 border border-gray-800/50">
              <EmailIcon className="text-white/50 mr-2" fontSize="small" />
              <span>{user?.email || 'Loading...'}</span>
            </div>
            <p className="text-white/50 text-xs mt-1">Email cannot be changed</p>
          </div>
          
          <div>
            <label className="block text-white/70 text-sm mb-2">Display Name</label>
            <input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#18092a]/80 text-white rounded-lg px-4 py-3 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50" 
              placeholder="Enter your display name"
            />
          </div>
          
          <div className="pt-4">
            <button 
              onClick={handleSaveChanges}
              disabled={isSaving || updateProfile.isPending || !displayName.trim()}
              className={`bg-[#00ff94]/10 text-[#00ff94] px-6 py-2.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 ${(isSaving || updateProfile.isPending || !displayName.trim()) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSaving || updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionGuidelines() {
  return (
    <div className="mt-6 mb-8 bg-[#18092a]/80 p-5 rounded-lg border border-amber-500/30">
      <h3 className="text-lg font-semibold mb-3 text-amber-400">Important Subscription Information</h3>
      
      <div className="space-y-4 text-sm text-white/80">
      <div>
          <h4 className="font-medium text-amber-300 mb-1">Upgrading Your Plan</h4>
          <p>To upgrade to a higher tier plan (e.g., from Pro to Creator):</p>
          <ol className="list-decimal ml-5 mt-2 space-y-1">
            <li>Cancel your current subscription</li>
            <li>Wait until the end of your current billing period</li>
            <li>Sign up for the upgraded plan after your current subscription expires</li>
          </ol>
          <p className="mt-2 text-amber-200/70 italic">Note: Your current plan benefits remain active until the end of your billing period.</p>
        </div>
        
        <div>
          <h4 className="font-medium text-amber-300 mb-1">Downgrading Your Plan</h4>
          <p>To downgrade to a lower tier plan:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Downgrading to Free:</strong> Simply cancel your current subscription. You'll automatically be moved to the Free plan once your billing period ends.</li>
            <li><strong>Downgrading to another paid plan:</strong> Cancel your current subscription, wait until the end of your billing period, then sign up for the new plan.</li>
          </ul>
        </div>
        
        <p className="pt-2 text-xs text-white/60">
          We currently don't support prorated billing when switching plans mid-cycle. 
          For any questions about your subscription, please contact <a href="mailto:support@getmemorix.app" className="text-[#00ff94] hover:underline">support@getmemorix.app</a>.
        </p>
      </div>
    </div>
  );
}

// New component for coupon code functionality
function CouponInput({ onApply, className = '' }) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // Use React Query validation hook
  const { mutateAsync: validateCoupon } = useValidateCoupon();

  const handleApply = async () => {
    if (!couponCode.trim()) {
      setValidationError('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      const result = await validateCoupon(couponCode.trim());
      if (result.valid) {
        onApply(couponCode.trim(), result);
      } else {
        setValidationError(result.message || 'Invalid coupon code');
      }
    } catch (error) {
      logger.error('Error validating coupon:', error);
      setValidationError('Failed to validate coupon. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleClearCoupon = () => {
    setCouponCode('');
    onApply(''); // Notify parent that coupon was cleared
  };
  
  return (
    <div className={`mt-4 ${className}`}>
      <h4 className="text-sm font-medium mb-2 text-white/80">Have a coupon code?</h4>
      
      {!couponCode && (
        // Coupon input form
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PercentIcon className="text-gray-400" fontSize="small" />
            </div>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="w-full pl-10 pr-3 py-2 bg-[#18092a]/80 text-white rounded-lg border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50"
            />
          </div>
          <button
            onClick={handleApply}
            disabled={isValidating || !couponCode.trim()}
            className={`px-4 py-2 bg-[#00ff94]/10 text-[#00ff94] rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 ${isValidating || !couponCode.trim() ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isValidating ? 'Validating...' : 'Apply'}
          </button>
        </div>
      )}
      
      {couponCode && (
        // Coupon applied state
        <div className="bg-[#00ff94]/10 border border-[#00ff94]/30 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium text-[#00ff94]">{couponCode}</span>
              <div className="flex items-center mt-1">
                <span className="text-white/70 line-through mr-2">£{validationError}</span>
                <span className="text-[#00ff94] font-bold">£{validationError}</span>
                <span className="text-white/70 text-xs ml-1">/month</span>
              </div>
              <p className="text-white/60 text-xs mt-1">{validationError}</p>
            </div>
            <button
              onClick={handleClearCoupon}
              className="text-white/50 hover:text-white/80 text-sm underline"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      
      {validationError && <p className="mt-2 text-sm text-red-500">{validationError}</p>}
    </div>
  );
}

function SubscriptionSettings() {
  const navigate = useNavigate();
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [portalError, setPortalError] = useState(null);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const { subscription, isLoading, isProSubscriber } = useSubscription();
  
  // Use React Query hooks
  const { mutateAsync: createPortalSession } = useCreatePortalSession();
  const { mutateAsync: createCheckoutSession } = useCreateCheckoutSession();

  useEffect(() => {
    fetchSubscriptionDetails();
  }, [subscription]);

  const fetchSubscriptionDetails = async () => {
    if (!subscription) return;
    
    try {
      // No need to fetch subscription details separately as it's already 
      // available through useSubscription() which uses React Query
      setSubscriptionDetails(subscription);
    } catch (error) {
      logger.error('Error fetching subscription details:', error);
    }
  };

  const handlePortalError = (errorMessage, errorCode) => {
    let errorText = errorMessage || 'Failed to load the subscription portal.';
    
    // Add guidance based on error code
    if (errorCode === 'customer_not_found') {
      errorText += ' It looks like you haven\'t set up a subscription yet.';
    } else if (errorCode === 'subscription_not_found') {
      errorText += ' It appears you don\'t have an active subscription.';
    }
    
    setPortalError(errorText);
  };

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    setPortalError(null);
    
    try {
      const { url } = await createPortalSession();
      
      // Navigate to Stripe Portal
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      logger.error('Failed to create portal session:', error);
      handlePortalError(error.message, error.code);
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    setIsCheckoutLoading(true);
    
    try {
      const { url } = await createCheckoutSession({ 
        plan, 
        couponCode: activeCoupon ? activeCoupon.code : undefined 
      });
      
      // Navigate to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      logger.error('Failed to create checkout session:', error);
      alert('There was an error creating your checkout session. Please try again.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const getCheckoutButtonText = (plan) => {
    if (isCheckoutLoading) {
      return 'Processing...';
    }
    
    if (subscription && subscription.plan === plan) {
      return 'Current Plan';
    }
    
    if (plan === 'pro') {
      return activeCoupon ? `Subscribe with ${activeCoupon.displayText}` : 'Subscribe to Pro';
    }
    
    return `Subscribe to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
  };

  const handleCouponApply = (code, couponData) => {
    setActiveCoupon({
      code,
      displayText: couponData.displayText || `Coupon: ${code}`,
      discount: couponData.discount
    });
  };

  if (isLoading) {
    return (
      <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
        <p className="text-white/70">Loading subscription information...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <h2 className="text-xl font-bold mb-6">Subscription</h2>
      
      {portalError && (
        <div className="mb-6 bg-gray-800/30 p-3 rounded border border-amber-500/30 text-amber-400 text-sm">
          <p>{portalError}</p>
          <p className="mt-2">You can still manage your subscription settings below.</p>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#2A083B] to-[#18092a] p-5 rounded-lg border border-[#00ff94]/20 shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Plan</span>
                <span className="bg-[#00ff94]/10 px-3 py-1 rounded-full text-sm text-[#00ff94]">
                  {(subscription?.plan || 'Free').charAt(0).toUpperCase() + 
                   (subscription?.plan || 'Free').slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <span className="text-white/70">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  subscription?.status === 'active'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {(subscription?.status || 'Inactive').charAt(0).toUpperCase() + 
                   (subscription?.status || 'Inactive').slice(1)}
                </span>
              </div>
              
              {subscription?.plan !== 'free' && (
                <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Next Billing Date</span>
                    <span>
                      {subscription?.nextBillingDate || 'Not available'}
                    </span>
                  </div>
                  
                  {subscription?.cancelAtPeriodEnd && (
                    <div className="mt-4 bg-gray-800/30 p-3 rounded text-amber-400 text-sm">
                      Your subscription will be canceled at the end of the current billing period.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <SubscriptionGuidelines />
        
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full text-white">
            <thead>
              <tr>
                <th className="py-2 pl-2 text-left border-b border-gray-800">Features</th>
                <th className="py-2 text-center border-b border-gray-800">Free</th>
                <th className="py-2 text-center border-b border-gray-800 bg-[#00ff94]/5">Pro</th>
                <th className="py-2 text-center border-b border-gray-800 bg-[#a259ff]/5">Creator</th>
                <th className="py-2 text-center border-b border-gray-800 bg-gray-700/20">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 pl-2 border-b border-gray-800/30">Basic Access</td>
                <td className="py-2 text-center border-b border-gray-800/30">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#00ff94]/5">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#a259ff]/5">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-gray-700/20">✓</td>
              </tr>
              <tr>
                <td className="py-2 pl-2 border-b border-gray-800/30">Community Cards</td>
                <td className="py-2 text-center border-b border-gray-800/30">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#00ff94]/5">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#a259ff]/5">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-gray-700/20">✓</td>
              </tr>
              <tr>
                <td className="py-2 pl-2 border-b border-gray-800/30">Unlimited Flashcards</td>
                <td className="py-2 text-center border-b border-gray-800/30">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#00ff94]/5">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#a259ff]/5">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-gray-700/20">✓</td>
              </tr>
              <tr>
                <td className="py-2 pl-2 border-b border-gray-800/30">Advanced Analytics</td>
                <td className="py-2 text-center border-b border-gray-800/30">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#00ff94]/5">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#a259ff]/5">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-gray-700/20">✓</td>
              </tr>
              <tr>
                <td className="py-2 pl-2 border-b border-gray-800/30">Custom Communities</td>
                <td className="py-2 text-center border-b border-gray-800/30">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#00ff94]/5">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#a259ff]/5">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-gray-700/20">✓</td>
              </tr>
              <tr>
                <td className="py-2 pl-2 border-b border-gray-800/30">Priority Support</td>
                <td className="py-2 text-center border-b border-gray-800/30">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#00ff94]/5">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#a259ff]/5">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-gray-700/20">✓</td>
              </tr>
              <tr>
                <td className="py-2 pl-2 border-b border-gray-800/30">Social Media Content</td>
                <td className="py-2 text-center border-b border-gray-800/30">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#00ff94]/5">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#a259ff]/5">✓</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-gray-700/20">✓</td>
              </tr>
              <tr>
                <td className="py-2 pl-2 border-b border-gray-800/30">Dedicated Support</td>
                <td className="py-2 text-center border-b border-gray-800/30">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#00ff94]/5">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#a259ff]/5">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-gray-700/20">✓</td>
              </tr>
              <tr>
                <td className="py-2 pl-2 border-b border-gray-800/30">Team Members</td>
                <td className="py-2 text-center border-b border-gray-800/30">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#00ff94]/5">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#a259ff]/5">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-gray-700/20">✓</td>
              </tr>
              <tr>
                <td className="py-2 pl-2 border-b border-gray-800/30">API Access</td>
                <td className="py-2 text-center border-b border-gray-800/30">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#00ff94]/5">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-[#a259ff]/5">—</td>
                <td className="py-2 text-center border-b border-gray-800/30 bg-gray-700/20">✓</td>
              </tr>
              <tr>
                <td className="py-3 pl-2">Price</td>
                <td className="py-3 text-center font-bold">Free</td>
                <td className="py-3 text-center font-bold text-[#00ff94] bg-[#00ff94]/5">£7.99/mo</td>
                <td className="py-3 text-center font-bold text-[#a259ff] bg-[#a259ff]/5">£17.99/mo</td>
                <td className="py-3 text-center font-bold text-gray-300 bg-gray-700/20">£49.99/mo</td>
              </tr>
              <tr>
                <td className="py-2"></td>
                <td className="py-2 text-center"></td>
                <td className="py-2 text-center bg-[#00ff94]/5">
                  {subscription?.plan === 'pro' ? (
                    <span className="inline-block px-3 py-1 text-xs bg-[#00ff94]/20 text-[#00ff94] rounded-full">Current Plan</span>
                  ) : (
                    <CheckoutButton
                      plan="pro"
                      text={getCheckoutButtonText('pro')}
                      className="bg-[#00ff94] text-[#18092a] px-4 py-1 text-sm rounded-lg hover:bg-[#00ff94]/90 transition-colors"
                      couponCode={activeCoupon ? activeCoupon.code : null}
                      onClick={() => handleSubscribe('pro')}
                    />
                  )}
                </td>
                <td className="py-2 text-center bg-[#a259ff]/5">
                  <span className="inline-block px-3 py-1 text-xs bg-gray-600/50 text-gray-300 rounded-full">Coming Soon</span>
                </td>
                <td className="py-2 text-center bg-gray-700/20">
                  <span className="inline-block px-3 py-1 text-xs bg-gray-600/50 text-gray-300 rounded-full">Coming Soon</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="pt-4 flex justify-center">
          {!isProSubscriber() && (
            <CheckoutButton
              plan="pro"
              text={getCheckoutButtonText('pro')}
              className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-2.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
              couponCode={activeCoupon ? activeCoupon.code : null}
              onClick={() => handleSubscribe('pro')}
            />
          )}
          {isProSubscriber() && (
            <ManageSubscriptionButton
              text="Manage Subscription"
              className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-2.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
              onError={handlePortalError}
            />
          )}
        </div>
      </div>
      
      <div>
        <h3 className="font-bold text-lg mb-4 text-white/90">Available Plans</h3>
        
        <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/30 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold">Free Plan</h4>
              <p className="text-white/70 text-sm">Basic features with limited usage</p>
            </div>
            {subscription?.plan === 'free' || !subscription?.plan ? (
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/80">Current</span>
            ) : null}
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Access Community Cards</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Basic Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Standard Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Web access</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-[#2E0033] to-[#1b1b2f] p-4 rounded-lg border border-[#00ff94]/30 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold">Pro Plan</h4>
              <p className="text-white/70 text-sm">Enhanced features for serious learners</p>
            </div>
            {subscription?.plan === 'pro' ? (
              <span className="bg-[#00ff94]/10 px-3 py-1 rounded-full text-xs text-[#00ff94]">Current</span>
            ) : (
              <span className="bg-[#00ff94]/10 px-3 py-1 rounded-full text-xs text-[#00ff94]">Recommended</span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Everything in Free plan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Unlimited Flashcard & Quiz creation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Advanced Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Priority Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Downloadable Content</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Export Reports</span>
            </div>
          </div>
          
          <CouponInput
            onApply={handleCouponApply}
            className="mt-4 mb-2"
          />
          
          <div className="mt-4">
            {subscription?.plan === 'pro' ? (
              <ManageSubscriptionButton
                text="Manage Subscription"
                className="bg-[#00ff94]/10 text-[#00ff94] font-medium px-4 py-2 rounded-lg w-full hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
                onError={handlePortalError}
              />
            ) : (
              <CheckoutButton
                plan="pro"
                text={getCheckoutButtonText('pro')}
                className="bg-[#00ff94] text-[#18092a] font-medium px-4 py-2 rounded-lg w-full hover:bg-[#00ff94]/90 transition-colors"
                couponCode={activeCoupon ? activeCoupon.code : null}
                onClick={() => handleSubscribe('pro')}
              />
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-[#4A154B] to-[#260033] p-4 rounded-lg border border-[#a259ff]/30 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold">Creator Plan</h4>
              <p className="text-white/70 text-sm">For content creators and educators</p>
            </div>
              <span className="bg-[#a259ff]/20 px-3 py-1 rounded-full text-xs text-[#a259ff]">Coming Soon</span>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#a259ff]" />
              <span>Everything in Pro plan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#a259ff]" />
              <span>Custom Communities</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#a259ff]" />
              <span>Custom Social Media Content</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#a259ff]" />
              <span>Advanced sharing options</span>
            </div>
          </div>
          <div className="mt-4">
            <button
              disabled
              className="bg-gray-600/30 text-gray-400 font-medium px-4 py-2 rounded-lg w-full cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
        
        <div className="bg-[#18092a] p-4 rounded-lg border border-gray-800/30 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold">Enterprise Plan</h4>
              <p className="text-white/70 text-sm">For organizations and institutions</p>
            </div>
            <span className="bg-gray-600/30 px-3 py-1 rounded-full text-xs text-gray-300">Coming Soon</span>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Dedicated Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>API Access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Multiple Team Members</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Admin Controls</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  // Get user profile data and preferences update mutation
  const { data: user, isLoading: isLoadingUser } = useUserProfile();
  const updatePreferences = useUpdateUserPreferences();
  
  // Initialize with null values instead of defaults to avoid overriding actual values
  const [notifications, setNotifications] = useState({
    emailNotifications: null,
    studyReminders: null,
    contentUpdates: null // Now properly supported in the schema
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize notification settings when user data is loaded
  useEffect(() => {
    if (user && user.preferences) {
      logger.debug('Loading user preferences:', { value: user.preferences });
      
      // Extract values from user preferences, defaulting to true if not found
      const userPrefs = {
        emailNotifications: user.preferences.emailNotifications !== undefined 
          ? user.preferences.emailNotifications 
          : true,
        studyReminders: user.preferences.studyReminders !== undefined 
          ? user.preferences.studyReminders 
          : true,
        contentUpdates: user.preferences.contentUpdates !== undefined 
          ? user.preferences.contentUpdates  // Now using actual field
          : true
      };
      
      logger.debug('Setting notification preferences from DB:', { value: userPrefs });
      setNotifications(userPrefs);
    }
  }, [user]);

  // Debug log when notifications state changes
  useEffect(() => {
    logger.debug('Current notification state:', { value: notifications });
  }, [notifications]);

  const handleToggle = (key) => {
    setNotifications(prev => {
      const newValue = !prev[key];
      logger.debug(`Toggling ${key} from ${prev[key]} to ${newValue}`);
      
      return {
        ...prev,
        [key]: newValue
      };
    });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Now sending all fields including contentUpdates
      const preferencesToSave = {
        emailNotifications: Boolean(notifications.emailNotifications),
        studyReminders: Boolean(notifications.studyReminders),
        contentUpdates: Boolean(notifications.contentUpdates)
      };
      
      logger.debug('Saving notification preferences:', { value: preferencesToSave });
      await updatePreferences.mutateAsync(preferencesToSave);
    } catch (error) {
      logger.error('Error saving notification preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
        <p className="text-white/70">Loading notification settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <h2 className="text-xl font-bold mb-6">Notification Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/30">
          <div>
            <h3 className="font-medium">Content Updates</h3>
            <p className="text-white/70 text-sm">Get notified about new features and content</p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={notifications.contentUpdates === true}
              onChange={() => handleToggle('contentUpdates')}
              className="sr-only peer" 
            />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ff94]"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/30">
          <div>
            <h3 className="font-medium">Study Reminders</h3>
            <p className="text-white/70 text-sm">Get notified about your learning activities and progress</p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={notifications.studyReminders === true}
              onChange={() => handleToggle('studyReminders')}
              className="sr-only peer" 
            />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ff94]"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/30">
          <div>
            <h3 className="font-medium">Email Notifications</h3>
            <p className="text-white/70 text-sm">Receive important updates and announcements via email</p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={notifications.emailNotifications === true}
              onChange={() => handleToggle('emailNotifications')}
              className="sr-only peer" 
            />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ff94]"></div>
          </label>
        </div>
        
        <div className="pt-4">
          <button 
            onClick={handleSaveChanges}
            disabled={isSaving || updatePreferences.isPending}
            className={`bg-[#00ff94]/10 text-[#00ff94] px-6 py-2.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 ${isSaving || updatePreferences.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSaving || updatePreferences.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function HelpAndSupportSettings() {
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <h2 className="text-xl font-bold mb-6">Help & Support</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="font-bold mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="bg-[#18092a]/80 rounded-lg p-4 border border-gray-800/50">
              <h4 className="font-medium mb-2">How does Memorix work?</h4>
              <p className="text-white/70 text-sm">Simply paste your notes or enter a concept you want to learn about. Our AI instantly turns this into flashcards optimized for learning. You can then study these cards using our spaced repetition system, take quizzes, and track your progress over time.</p>
            </div>
            
            <div className="bg-[#18092a]/80 rounded-lg p-4 border border-gray-800/50">
              <div className="py-3">
                <h4 className="font-medium mb-2">Is Memorix free to use?</h4>
                <p className="text-white/70 text-sm">
                  We offer a free tier with access to community cards, basic analytics, and standard support. Our Pro subscription (£7.99/month) unlocks unlimited flashcard creation, advanced analytics, priority support, and more. We also have upcoming Creator and Enterprise plans for content creators and organizations.
                </p>
              </div>
            </div>
            
            <div className="bg-[#18092a]/80 rounded-lg p-4 border border-gray-800/50">
              <h4 className="font-medium mb-2">How accurate are the AI-generated flashcards?</h4>
              <p className="text-white/70 text-sm">Our AI is trained on educational content and optimized for learning efficiency. While the AI is very accurate, you can always edit any card if needed. We continuously improve our AI based on user feedback.</p>
            </div>
            
            <div className="bg-[#18092a]/80 rounded-lg p-4 border border-gray-800/50">
              <h4 className="font-medium mb-2">How do I contact support?</h4>
              <p className="text-white/70 text-sm">For any questions or issues, please email us at <a href="mailto:support@getmemorix.app" className="text-[#00ff94] hover:underline">support@getmemorix.app</a>. Our team typically responds within 24 hours.</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-4">Legal</h3>
          <div className="space-y-4">
            <div className="bg-[#18092a]/80 rounded-lg p-4 border border-gray-800/50">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Privacy Policy</h4>
                <Link 
                  to="/privacy" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 text-sm"
                >
                  View
                </Link>
              </div>
            </div>
            
            <div className="bg-[#18092a]/80 rounded-lg p-4 border border-gray-800/50">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Terms of Service</h4>
                <Link 
                  to="/terms" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 text-sm"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-4">Contact Support</h3>
          <div className="bg-[#18092a]/80 rounded-lg p-6 border border-gray-800/50 flex flex-col items-center text-center">
            <EmailIcon style={{ fontSize: 48 }} className="text-[#00ff94] mb-3" />
            <h4 className="font-medium mb-2">Email Support</h4>
            <p className="text-white/70 text-sm mb-4">Our support team is ready to help with any questions or issues</p>
            <a 
              href="mailto:support@getmemorix.app" 
              className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-2.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-block"
            >
              support@getmemorix.app
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsContent({ activeSection, setActiveSection }) {
  // Return the appropriate settings section based on active selection
  switch (activeSection) {
    case 'account':
      return <AccountSettings setActiveSection={setActiveSection} />;
    case 'subscription':
      return <SubscriptionSettings />;
    case 'notifications':
      return <NotificationSettings />;
    case 'help':
      return <HelpAndSupportSettings />;
    default:
      return <AccountSettings setActiveSection={setActiveSection} />;
  }
}

function Settings() {
  const [activeSection, setActiveSection] = useState('account');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(max-width:1024px)');
  
  return (
    <Layout
      title="Settings"
      activePage="settings"
      searchEnabled={false}
      filterEnabled={false}
    >
      {isMobile && (
        <div className="mb-4 flex items-center">
          {showMobileMenu ? (
            <button 
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-1 text-white/70 hover:text-white"
            >
              <KeyboardArrowLeftIcon fontSize="small" />
              <span>Back</span>
            </button>
          ) : (
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {(!isMobile || !showMobileMenu) && (
          <div className="lg:col-span-1">
            <SettingsNav
              activeSection={activeSection}
              setActiveSection={(section) => {
                setActiveSection(section);
                if (isMobile) {
                  setShowMobileMenu(true);
                }
              }}
            />
          </div>
        )}
        
        {(!isMobile || showMobileMenu) && (
          <div className="lg:col-span-3">
            <SettingsContent 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Settings 