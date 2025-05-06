import { useState, useEffect } from 'react'
import { useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import Layout from '../components/Layout'

// Icons
import NotificationsIcon from '@mui/icons-material/Notifications'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import HelpIcon from '@mui/icons-material/Help'
import CheckIcon from '@mui/icons-material/Check'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import EmailIcon from '@mui/icons-material/Email'

// API hooks
import { useUserProfile, useUpdateUserProfile, useUpdateUserPreferences } from '../api/queries/users'

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

function AccountSettings() {
  // Get user profile data and update mutation
  const { data: user, isLoading: isLoadingUser } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize display name when user data is loaded
  useEffect(() => {
    if (user) {
      console.log('Loading user profile:', user);
      setDisplayName(user.name || '');
    }
  }, [user]);

  // Debug logging when display name changes
  useEffect(() => {
    console.log('Current display name state:', displayName);
  }, [displayName]);

  const handleSaveChanges = async () => {
    if (!displayName.trim()) {
      // Prevent saving empty display name
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Saving profile update:', { name: displayName });
      await updateProfile.mutateAsync({ name: displayName });
      // Success is handled by the mutation
    } catch (error) {
      console.error('Error saving profile changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
        <p className="text-white/70">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <h2 className="text-xl font-bold mb-6">Account Settings</h2>
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#a259ff]/20 rounded-full flex items-center justify-center">
            <AccountCircleIcon style={{ fontSize: '2rem' }} className="text-[#a259ff]" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{user?.name || displayName}</h3>
            <p className="text-white/70 text-sm">Free Plan</p>
          </div>
          <button className="sm:ml-auto bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30">
            Upgrade Plan
          </button>
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
      
      <div>
        <h3 className="font-bold text-lg mb-4 text-white/90">Subscription</h3>
        <div className="bg-[#18092a] p-4 rounded-lg border border-gray-800/30 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold">Free Plan</h4>
              <p className="text-white/70 text-sm">Basic features with limited usage</p>
            </div>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/80">Current</span>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>50 cards per day</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Basic analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Standard export</span>
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
              <h4 className="font-bold">Premium Plan</h4>
              <p className="text-white/70 text-sm">Unlimited access to all features</p>
            </div>
            <span className="bg-[#00ff94]/10 px-3 py-1 rounded-full text-xs text-[#00ff94]">Recommended</span>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Unlimited cards</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Advanced analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Mobile access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>No ads</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon fontSize="small" className="text-[#00ff94]" />
              <span>Offline mode</span>
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-[#00ff94] text-[#18092a] font-medium px-4 py-2 rounded-lg w-full hover:bg-[#00ff94]/90 transition-colors">
              Upgrade to Premium - $9.99/month
            </button>
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
      console.log('Loading user preferences:', user.preferences);
      
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
      
      console.log('Setting notification preferences from DB:', userPrefs);
      setNotifications(userPrefs);
    }
  }, [user]);

  // Debug log when notifications state changes
  useEffect(() => {
    console.log('Current notification state:', notifications);
  }, [notifications]);

  const handleToggle = (key) => {
    setNotifications(prev => {
      const newValue = !prev[key];
      console.log(`Toggling ${key} from ${prev[key]} to ${newValue}`);
      
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
      
      console.log('Saving notification preferences:', preferencesToSave);
      await updatePreferences.mutateAsync(preferencesToSave);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
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
              <h4 className="font-medium mb-2">Is Memorix free to use?</h4>
              <p className="text-white/70 text-sm">We offer a free tier with up to 50 cards per day and basic features. Our Premium subscription ($9.99/month) unlocks unlimited cards, advanced analytics, offline mode, and removes ads.</p>
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

function SettingsContent({ activeSection }) {
  // Return the appropriate settings section based on active selection
  switch (activeSection) {
    case 'account':
      return <AccountSettings />;
    case 'notifications':
      return <NotificationSettings />;
    case 'help':
      return <HelpAndSupportSettings />;
    default:
      return <AccountSettings />;
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
            <SettingsContent activeSection={activeSection} />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Settings 