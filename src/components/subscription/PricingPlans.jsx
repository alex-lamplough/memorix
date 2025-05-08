import { useState } from 'react';
import { CheckIcon } from '@mui/icons-material';
import StripeWidget from './StripeWidget';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '£0',
    description: 'Basic features for getting started',
    features: [
      'View community cards',
      'Basic analytics',
      'Standard support',
      'Limited flashcards (100)'
    ],
    isMostPopular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '£7.99',
    description: 'Everything you need for personal use',
    features: [
      'Unlimited flashcards',
      'Unlimited quizzes',
      'Advanced analytics',
      'Priority support',
      'Download content',
      'Export reports'
    ],
    isMostPopular: true
  },
  {
    id: 'creator',
    name: 'Creator',
    price: '£17.99',
    description: 'Advanced features for content creators',
    features: [
      'All Pro features',
      'Custom communities',
      'Social media content',
      'Analytics dashboard',
      'Premium support',
      'Collaboration tools'
    ],
    isMostPopular: false
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Contact Us',
    description: 'Custom solutions for large organizations',
    features: [
      'All Creator features',
      'API Access',
      'Multiple team members',
      'Admin controls',
      'Dedicated support',
      'Custom integrations'
    ],
    isMostPopular: false
  }
];

/**
 * Component to display pricing plans
 * 
 * @param {Object} props
 * @param {Object} props.currentSubscription - Current user subscription details
 * @param {Function} props.onSubscriptionUpdate - Callback when subscription is updated
 * @param {Object} props.user - Current user object
 */
const PricingPlans = ({ currentSubscription, onSubscriptionUpdate, user }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    
    // If enterprise, redirect to contact form
    if (planId === 'enterprise') {
      window.location.href = '/contact?subject=Enterprise%20Plan';
      return;
    }
  };
  
  // If we have a selected plan that's not free or enterprise, show the Stripe widget
  const showStripeWidget = selectedPlan && selectedPlan !== 'free' && selectedPlan !== 'enterprise';
  
  // Determine the user's current plan
  const currentPlanId = currentSubscription?.plan || 'free';
  
  return (
    <div className="pricing-plans w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId;
          const isSelected = plan.id === selectedPlan;
          
          return (
            <div 
              key={plan.id}
              className={`
                border rounded-lg p-6 transition-all
                ${isCurrentPlan ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}
                ${isSelected ? 'ring-2 ring-indigo-500' : ''}
                ${plan.isMostPopular ? 'relative' : ''}
              `}
            >
              {plan.isMostPopular && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <span className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-2xl font-bold">{plan.price}</span>
                {plan.id !== 'enterprise' && <span className="text-gray-500 text-sm">/month</span>}
              </div>
              
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              <ul className="mb-6 space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckIcon className="text-green-500 mr-2 h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={isCurrentPlan}
                className={`
                  w-full py-2 px-4 rounded-md transition duration-150
                  ${isCurrentPlan 
                    ? 'bg-indigo-100 text-indigo-700 cursor-default'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                `}
              >
                {isCurrentPlan 
                  ? 'Current Plan' 
                  : plan.id === 'free' 
                    ? 'Switch to Free'
                    : `Select ${plan.name}`
                }
              </button>
            </div>
          );
        })}
      </div>
      
      {showStripeWidget && (
        <div className="mt-8 border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">
            Subscribe to {plans.find(p => p.id === selectedPlan)?.name} Plan
          </h3>
          <StripeWidget
            user={user}
            subscription={currentSubscription}
            onSubscriptionUpdate={onSubscriptionUpdate}
            className="max-w-md mx-auto"
          />
        </div>
      )}
      
      {currentSubscription && currentSubscription.plan !== 'free' && !showStripeWidget && (
        <div className="mt-8 border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Manage Your Subscription</h3>
          <StripeWidget
            user={user}
            subscription={currentSubscription}
            onSubscriptionUpdate={onSubscriptionUpdate}
            className="max-w-md mx-auto"
          />
        </div>
      )}
    </div>
  );
};

export default PricingPlans; 