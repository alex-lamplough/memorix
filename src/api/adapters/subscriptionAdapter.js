import apiClient from '../apiClient';
import logger from '../../utils/logger';
import axios from 'axios';

// Create a map to track in-flight requests (for cancellation)
const requestMap = new Map();

// Helper to create a cancellable request
const createCancellableRequest = (endpoint) => {
  // Cancel any existing request for this endpoint
  if (requestMap.has(endpoint)) {
    requestMap.get(endpoint).abort();
  }
  
  // Create a new controller
  const controller = new AbortController();
  requestMap.set(endpoint, controller);
  
  return {
    signal: controller.signal,
    cleanup: () => requestMap.delete(endpoint)
  };
};

// Cancel all requests
export const cancelAllRequests = () => {
  if (requestMap.size > 0) {
    logger.info(`Cancelling ${requestMap.size} pending subscription API requests`);
    
    requestMap.forEach((controller, endpoint) => {
      logger.debug(`Cancelling request to: ${endpoint}`);
      controller.abort('Navigation cancelled the request');
    });
    
    requestMap.clear();
  }
};

// Adapter functions that will be used by React Query hooks
export const subscriptionAdapter = {
  cancelAllRequests,

  /**
   * Get current user's subscription status
   * @returns {Promise<Object>} Subscription details
   */
  getCurrentSubscription: async () => {
    const { signal, cleanup } = createCancellableRequest('subscriptions/current');
    try {
      const response = await apiClient.get('/subscriptions/current', { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },

  /**
   * Get detailed subscription information including Stripe metadata
   * @returns {Promise<Object>} Detailed subscription information
   */
  getSubscriptionDetails: async () => {
    const { signal, cleanup } = createCancellableRequest('subscriptions/details');
    try {
      const response = await apiClient.get('/subscriptions/details', { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },

  /**
   * Create a checkout session for subscription
   * @param {string} plan - Plan type ('pro', 'creator', 'enterprise')
   * @param {string} couponCode - Optional coupon code to apply
   * @returns {Promise<Object>} Session details with URL
   */
  createCheckoutSession: async (params) => {
    const { plan, couponCode = '' } = params;
    const { signal, cleanup } = createCancellableRequest('subscriptions/create-checkout-session');
    try {
      const response = await apiClient.post('/subscriptions/create-checkout-session', { 
        plan,
        couponCode: couponCode.trim()
      }, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },

  /**
   * Create a portal session for managing subscription
   * @returns {Promise<Object>} Session details with URL
   */
  createPortalSession: async () => {
    const { signal, cleanup } = createCancellableRequest('subscriptions/create-portal-session');
    try {
      const response = await apiClient.post('/subscriptions/create-portal-session', {}, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },

  /**
   * Cancel subscription at the end of the current billing period
   * @returns {Promise<Object>} Updated subscription information
   */
  cancelSubscription: async () => {
    const { signal, cleanup } = createCancellableRequest('subscriptions/cancel');
    try {
      const response = await apiClient.post('/subscriptions/cancel', {}, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },

  /**
   * Reactivate a subscription that was set to cancel
   * @returns {Promise<Object>} Updated subscription information
   */
  reactivateSubscription: async () => {
    const { signal, cleanup } = createCancellableRequest('subscriptions/reactivate');
    try {
      const response = await apiClient.post('/subscriptions/reactivate', {}, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },

  /**
   * Validate a coupon code with Stripe
   * @param {string} couponCode - Coupon code to validate 
   * @returns {Promise<Object>} Coupon details including validity and discount information
   */
  validateCoupon: async (couponCode) => {
    if (!couponCode || !couponCode.trim()) {
      throw new Error('No coupon code provided');
    }
    
    const { signal, cleanup } = createCancellableRequest('subscriptions/validate-coupon');
    try {
      const response = await apiClient.post('/subscriptions/validate-coupon', { 
        couponCode: couponCode.trim() 
      }, { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },

  /**
   * Check if a specific feature is available for the current user
   * @param {Object} subscription - User's subscription data
   * @param {string} feature - Feature name to check
   * @returns {boolean} Whether the feature is available
   */
  isFeatureAvailable: (subscription, feature) => {
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
  }
}; 