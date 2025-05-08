import React, { useState, useEffect } from 'react';
import logger from '../../utils/logger';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';

// Step components
import BasicInfoStep from './steps/BasicInfoStep';
import InterestsStep from './steps/InterestsStep';
import CompletionStep from './steps/CompletionStep';

// Fetch onboarding status
const fetchOnboardingStatus = async () => {
  try {
    const response = await apiClient.get('/users/me/onboarding');
    logger.debug('Fetched onboarding status:', { value: response.data });
    return response.data;
  } catch (error) {
    logger.error('Error fetching onboarding status:', error);
    return { stage: 'not_started', completed: false, requiresOnboarding: true };
  }
};

// Update onboarding stage
const updateOnboardingStage = async ({ stage, profileData }) => {
  logger.debug(`Updating onboarding stage to: ${stage}`, { value: profileData });
  const response = await apiClient.put('/users/me/onboarding', { stage, profileData });
  logger.debug('Onboarding update response:', { value: response.data });
  return response.data;
};

const OnboardingForm = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    userType: '',
    interests: [],
    learningGoals: [],
    theme: 'system',
    emailNotifications: true,
    studyReminders: true,
    defaultStudyTime: 20
  });

  // Fetch current onboarding status
  const { data: onboardingStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['onboardingStatus'],
    queryFn: fetchOnboardingStatus,
    enabled: !loading && !!user, // Only fetch when auth is loaded and user exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation for updating onboarding stage
  const stageMutation = useMutation({
    mutationFn: updateOnboardingStage,
    onSuccess: (data) => {
      logger.debug('Onboarding stage updated:', { value: data });
      
      // Update the onboarding status in the query cache
      queryClient.setQueryData(['onboardingStatus'], {
        stage: data.user?.profile?.onboardingStage || 'not_started',
        completed: data.user?.profile?.profileCompleted || false,
        requiresOnboarding: !(data.user?.profile?.profileCompleted || false)
      });
      
      // Also invalidate the cache to ensure it's refreshed next time
      queryClient.invalidateQueries({ queryKey: ['onboardingStatus'] });
      
      // Force a refetch to ensure we have the latest status
      refetchStatus();
      
      // If completed, redirect to dashboard
      if (data.user?.profile?.profileCompleted) {
        logger.debug('Onboarding completed, redirecting to dashboard');
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      logger.error('Error updating onboarding stage:', error);
      // Display an error message to the user
      alert('There was an error saving your information. Please try again.');
    }
  });

  // Initialize form data from user profile if available
  useEffect(() => {
    if (user && user.profile) {
      setFormData(prevData => ({
        ...prevData,
        displayName: user.profile.displayName || user.name || '',
        bio: user.profile.bio || '',
        userType: user.profile.userType || '',
        interests: user.profile.interests || [],
        learningGoals: user.profile.learningGoals || [],
        theme: user.preferences?.theme || 'system',
        emailNotifications: user.preferences?.emailNotifications ?? true,
        studyReminders: user.preferences?.studyReminders ?? true,
        defaultStudyTime: user.preferences?.defaultStudyTime || 20
      }));
    }
  }, [user]);

  // Determine initial step based on onboarding status
  useEffect(() => {
    if (onboardingStatus) {
      logger.debug('Setting initial step based on status:', { value: onboardingStatus });
      
      switch (onboardingStatus.stage) {
        case 'not_started':
          setCurrentStep(0); // Basic info
          break;
        case 'basic_info':
          setCurrentStep(1); // Interests (skip preferences)
          break;
        case 'interests':
          setCurrentStep(2); // Completion
          break;
        case 'completed':
          setCurrentStep(2); // Completion (already done)
          break;
        default:
          setCurrentStep(0);
      }
      
      // If onboarding is already completed, redirect to dashboard
      if (onboardingStatus.completed) {
        logger.debug('Onboarding already completed, redirecting to dashboard');
        navigate('/dashboard');
      }
    }
  }, [onboardingStatus, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (name, values) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: values
    }));
  };

  const handleSubmitStep = async (step) => {
    let stage;
    let profileData = {};
    
    switch (step) {
      case 0: // Basic info completed
        stage = 'basic_info';
        profileData = {
          displayName: formData.displayName,
          bio: formData.bio,
          userType: formData.userType,
          // Also include preferences in this step since we're skipping the preferences step
          preferences: {
            theme: formData.theme,
            emailNotifications: formData.emailNotifications,
            studyReminders: formData.studyReminders,
            defaultStudyTime: formData.defaultStudyTime
          }
        };
        break;
      case 1: // Interests completed
        stage = 'interests';
        profileData = {
          interests: formData.interests,
          learningGoals: formData.learningGoals
        };
        break;
      case 2: // Completion
        stage = 'completed';
        // Ensure profile is marked as completed with both flags
        profileData = {
          profileCompleted: true,
          onboardingStage: 'completed'
        };
        
        // Also update onboarding status in the query cache immediately
        queryClient.setQueryData(['onboardingStatus'], {
          stage: 'completed',
          completed: true,
          requiresOnboarding: false
        });

        // Log completion
        logger.debug('🎉 Marking onboarding as COMPLETED');
        break;
      default:
        return;
    }
    
    logger.debug(`Submitting step ${step} with stage: ${stage}`);
    
    // Update onboarding stage
    stageMutation.mutate({ stage, profileData });
    
    // Move to next step (unless we're at completion)
    if (step < 2) {
      setCurrentStep(step + 1);
    }
  };

  // If still loading, show loader
  if (loading || statusLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f]">
        <div className="w-16 h-16 border-4 border-t-[#00ff94] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white">Loading your profile...</p>
      </div>
    );
  }

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep 
            formData={formData} 
            onChange={handleInputChange} 
            onSubmit={() => handleSubmitStep(0)} 
            isSubmitting={stageMutation.isPending}
          />
        );
      case 1:
        return (
          <InterestsStep 
            formData={formData} 
            onChange={handleInputChange} 
            onArrayChange={handleArrayChange}
            onSubmit={() => handleSubmitStep(1)} 
            isSubmitting={stageMutation.isPending}
          />
        );
      case 2:
        return (
          <CompletionStep 
            formData={formData}
            onSubmit={() => handleSubmitStep(2)} 
            isSubmitting={stageMutation.isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] flex items-center justify-center">
      <div className="w-full max-w-3xl bg-[#18092a]/60 p-8 rounded-xl shadow-lg text-white">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Welcome to Memorix</h1>
            <div className="flex items-center">
              <span className="text-sm text-white/70">Step {currentStep + 1} of 3</span>
              <div className="ml-4 w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00ff94] rounded-full"
                  style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <p className="text-white/70">Let's get your profile set up so you can start learning.</p>
        </div>
        
        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingForm; 