import React, { useState } from 'react';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import SubscriptionInfo from '../components/settings/SubscriptionInfo';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [searchParams] = useSearchParams();
  
  // Check for subscription status in URL
  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    
    if (subscriptionStatus === 'success') {
      toast.success('Subscription updated successfully!');
      // Activate subscription tab
      setActiveTab('subscription');
    } else if (subscriptionStatus === 'canceled') {
      toast.info('Subscription checkout canceled.');
    } else if (searchParams.get('upgrade') === 'success') {
      toast.success('Subscription upgraded successfully!');
      setActiveTab('subscription');
    } else if (searchParams.get('downgrade') === 'success') {
      toast.success('Subscription will be downgraded at the end of your billing period.');
      setActiveTab('subscription');
    }
  }, [searchParams]);
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-gray-600 mb-6">Manage your account settings and preferences</p>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Tabs sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <nav className="flex flex-col">
              <button 
                className={`text-left px-4 py-3 border-l-4 ${activeTab === 'profile' 
                  ? 'border-primary bg-primary/5 text-primary font-semibold' 
                  : 'border-transparent hover:bg-gray-50'}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              
              <button 
                className={`text-left px-4 py-3 border-l-4 ${activeTab === 'subscription' 
                  ? 'border-primary bg-primary/5 text-primary font-semibold' 
                  : 'border-transparent hover:bg-gray-50'}`}
                onClick={() => setActiveTab('subscription')}
              >
                Subscription
              </button>
              
              <button 
                className={`text-left px-4 py-3 border-l-4 ${activeTab === 'security' 
                  ? 'border-primary bg-primary/5 text-primary font-semibold' 
                  : 'border-transparent hover:bg-gray-50'}`}
                onClick={() => setActiveTab('security')}
              >
                Security
              </button>
              
              <button 
                className={`text-left px-4 py-3 border-l-4 ${activeTab === 'appearance' 
                  ? 'border-primary bg-primary/5 text-primary font-semibold' 
                  : 'border-transparent hover:bg-gray-50'}`}
                onClick={() => setActiveTab('appearance')}
              >
                Appearance
              </button>
              
              <button 
                className={`text-left px-4 py-3 border-l-4 ${activeTab === 'notifications' 
                  ? 'border-primary bg-primary/5 text-primary font-semibold' 
                  : 'border-transparent hover:bg-gray-50'}`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'subscription' && <SubscriptionInfo />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
};

export default Settings; 