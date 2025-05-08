import axios from 'axios';

// Base URL from environment variables or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance for subscription API
const subscriptionApi = axios.create({
  baseURL: `${API_URL}/subscriptions`,
  withCredentials: true
});

// Interceptor to add authorization header
subscriptionApi.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Get current user's subscription status
 * @returns {Promise<Object>} Subscription details
 */
const getCurrentSubscription = async () => {
  try {
    const response = await subscriptionApi.get('/current');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
};

/**
 * Get detailed subscription information including Stripe metadata
 * @returns {Promise<Object>} Detailed subscription information
 */
const getSubscriptionDetails = async () => {
  try {
    const response = await subscriptionApi.get('/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    throw error;
  }
};

/**
 * Create a checkout session for subscription
 * @param {string} plan - Plan type ('pro', 'creator', 'enterprise')
 * @param {string} couponCode - Optional coupon code to apply
 * @returns {Promise<Object>} Session details with URL
 */
const createCheckoutSession = async (plan, couponCode = '') => {
  try {
    const response = await subscriptionApi.post('/create-checkout-session', { 
      plan,
      couponCode: couponCode.trim() // Send coupon code if provided
    });
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Create a portal session for managing subscription
 * @returns {Promise<Object>} Session details with URL
 */
const createPortalSession = async () => {
  try {
    const response = await subscriptionApi.post('/create-portal-session');
    return response.data;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

/**
 * Cancel subscription at the end of the current billing period
 * @returns {Promise<Object>} Updated subscription information
 */
const cancelSubscription = async () => {
  try {
    const response = await subscriptionApi.post('/cancel');
    return response.data;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

/**
 * Reactivate a subscription that was set to cancel
 * @returns {Promise<Object>} Updated subscription information
 */
const reactivateSubscription = async () => {
  try {
    const response = await subscriptionApi.post('/reactivate');
    return response.data;
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
};

/**
 * Check if a specific feature is available for the current user
 * This is a client-side helper that can check if a feature should be available
 * but the server will do the actual verification
 * @param {Object} subscription - User's subscription data
 * @param {string} feature - Feature name to check
 * @returns {boolean} Whether the feature is available
 */
const isFeatureAvailable = (subscription, feature) => {
  const featureMap = {
    free: [
      'view_community_cards',
      'basic_analytics',
      'standard_support'
    ],
    pro: [
      'view_community_cards',
      'basic_analytics',
      'standard_support',
      'unlimited_flashcards',
      'unlimited_quizzes',
      'advanced_analytics',
      'priority_support',
      'download_content',
      'export_reports'
    ],
    creator: [
      'view_community_cards',
      'basic_analytics',
      'standard_support',
      'unlimited_flashcards',
      'unlimited_quizzes',
      'advanced_analytics',
      'priority_support',
      'download_content',
      'export_reports',
      'custom_communities',
      'social_media_content'
    ],
    enterprise: [
      'view_community_cards',
      'basic_analytics',
      'standard_support',
      'unlimited_flashcards',
      'unlimited_quizzes',
      'advanced_analytics',
      'priority_support',
      'download_content',
      'export_reports',
      'custom_communities',
      'social_media_content',
      'api_access',
      'multi_team_members',
      'admin_controls',
      'dedicated_support'
    ]
  };
  
  const plan = subscription?.plan || 'free';
  const status = subscription?.status || 'inactive';
  
  // Only check features for active subscriptions
  if (status !== 'active') {
    // Free features are always available
    return featureMap.free.includes(feature);
  }
  
  return featureMap[plan].includes(feature);
};

/**
 * Validate a coupon code with Stripe
 * @param {string} couponCode - Coupon code to validate 
 * @returns {Promise<Object>} Coupon details including validity and discount information
 */
const validateCoupon = async (couponCode) => {
  try {
    if (!couponCode || !couponCode.trim()) {
      throw new Error('No coupon code provided');
    }
    
    const response = await subscriptionApi.post('/validate-coupon', { 
      couponCode: couponCode.trim() 
    });
    
    return response.data;
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

export const subscriptionService = {
  getCurrentSubscription,
  getSubscriptionDetails,
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  reactivateSubscription,
  isFeatureAvailable,
  validateCoupon
};

export default subscriptionService; 