import { useState } from 'react'
import { useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'

// Icons
import NotificationsIcon from '@mui/icons-material/Notifications'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LanguageIcon from '@mui/icons-material/Language'
import SecurityIcon from '@mui/icons-material/Security'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CloudSyncIcon from '@mui/icons-material/CloudSync'
import DeleteIcon from '@mui/icons-material/Delete'
import HelpIcon from '@mui/icons-material/Help'
import CheckIcon from '@mui/icons-material/Check'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'

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
    { id: 'appearance', label: 'Appearance', icon: <DarkModeIcon fontSize="small" /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon fontSize="small" /> },
    { id: 'language', label: 'Language', icon: <LanguageIcon fontSize="small" /> },
    { id: 'security', label: 'Security & Privacy', icon: <SecurityIcon fontSize="small" /> },
    { id: 'sync', label: 'Data & Sync', icon: <CloudSyncIcon fontSize="small" /> },
    { id: 'data', label: 'Data Management', icon: <DeleteIcon fontSize="small" /> },
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
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <h2 className="text-xl font-bold mb-6">Account Settings</h2>
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#a259ff]/20 rounded-full flex items-center justify-center">
            <AccountCircleIcon style={{ fontSize: '2rem' }} className="text-[#a259ff]" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Alex Lamplough</h3>
            <p className="text-white/70 text-sm">Free Plan</p>
          </div>
          <button className="sm:ml-auto bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30">
            Upgrade Plan
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-white/70 text-sm mb-2">Email</label>
            <input 
              type="email" 
              value="alex@example.com" 
              className="w-full bg-[#18092a]/80 text-white rounded-lg px-4 py-3 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50" 
            />
          </div>
          
          <div>
            <label className="block text-white/70 text-sm mb-2">Display Name</label>
            <input 
              type="text" 
              value="Alex Lamplough" 
              className="w-full bg-[#18092a]/80 text-white rounded-lg px-4 py-3 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50" 
            />
          </div>
          
          <div className="pt-4">
            <button className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-2.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30">
              Save Changes
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

function AppearanceSettings() {
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <h2 className="text-xl font-bold mb-6">Appearance</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-bold mb-4">Theme</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#18092a] border-2 border-[#00ff94] p-4 rounded-lg text-center cursor-pointer">
              <div className="h-24 bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] rounded mb-2"></div>
              <span className="text-sm font-medium">Dark</span>
            </div>
            <div className="bg-[#18092a] border border-gray-800/50 p-4 rounded-lg text-center cursor-pointer hover:border-white/30">
              <div className="h-24 bg-gradient-to-b from-[#f1f5f9] to-[#e2e8f0] rounded mb-2"></div>
              <span className="text-sm font-medium text-white/70">Light</span>
            </div>
            <div className="bg-[#18092a] border border-gray-800/50 p-4 rounded-lg text-center cursor-pointer hover:border-white/30">
              <div className="h-24 bg-gradient-to-b from-[#111827] to-[#1f2937] rounded mb-2"></div>
              <span className="text-sm font-medium text-white/70">System</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-4">Accent Color</h3>
          <div className="flex gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-full bg-[#00ff94] border-2 border-white cursor-pointer"></div>
            <div className="w-10 h-10 rounded-full bg-[#a259ff] border border-gray-800/50 cursor-pointer"></div>
            <div className="w-10 h-10 rounded-full bg-[#3ec1ff] border border-gray-800/50 cursor-pointer"></div>
            <div className="w-10 h-10 rounded-full bg-[#ff7262] border border-gray-800/50 cursor-pointer"></div>
            <div className="w-10 h-10 rounded-full bg-[#ffeb3b] border border-gray-800/50 cursor-pointer"></div>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-4">Font Size</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">A</span>
            <input 
              type="range" 
              min="1" 
              max="3" 
              defaultValue="2"
              className="flex-1 accent-[#00ff94]" 
            />
            <span className="text-lg text-white/70">A</span>
          </div>
        </div>
        
        <div className="pt-4">
          <button className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-2.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <h2 className="text-xl font-bold mb-6">Notification Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/30">
          <div>
            <h3 className="font-medium">Daily Study Reminder</h3>
            <p className="text-white/70 text-sm">Receive a reminder to study your flashcards</p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ff94]"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/30">
          <div>
            <h3 className="font-medium">New Content Alerts</h3>
            <p className="text-white/70 text-sm">Get notified about new features and content</p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ff94]"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/30">
          <div>
            <h3 className="font-medium">Weekly Progress Report</h3>
            <p className="text-white/70 text-sm">Summary of your weekly learning activity</p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ff94]"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/30">
          <div>
            <h3 className="font-medium">Email Notifications</h3>
            <p className="text-white/70 text-sm">Receive email notifications</p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ff94]"></div>
          </label>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Daily Reminder Time</h3>
          <div className="flex gap-3">
            <input 
              type="time" 
              defaultValue="19:00"
              className="bg-[#18092a]/80 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50" 
            />
            <button className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30">
              Set
            </button>
          </div>
        </div>
        
        <div className="pt-4">
          <button className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-2.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30">
            Save Changes
          </button>
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
    case 'appearance':
      return <AppearanceSettings />;
    case 'notifications':
      return <NotificationSettings />;
    case 'language':
      return (
        <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
          <h2 className="text-xl font-bold mb-6">Language Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">Application Language</label>
              <select className="w-full bg-[#18092a]/80 text-white rounded-lg px-4 py-3 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            <div className="pt-4">
              <button className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-2.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
          <h2 className="text-xl font-bold mb-6">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Settings</h2>
          <p className="text-white/70">This settings section is under development.</p>
        </div>
      );
  }
}

function Settings() {
  const [activeSection, setActiveSection] = useState('account');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(max-width:1024px)');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex flex-col md:flex-row">
      {/* Mobile menu button */}
      {isMobile && (
        <div className="p-4 flex items-center justify-end sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white rounded-lg hover:bg-white/10"
          >
            <MenuIcon />
          </button>
        </div>
      )}
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar - fixed position on desktop, overlay on mobile */}
      <div className={`fixed top-0 left-0 bottom-0 w-64 transform transition-transform duration-300 ease-in-out z-40 ${isMobile && !sidebarOpen ? '-translate-x-full' : ''} ${isMobile && sidebarOpen ? 'translate-x-0' : ''}`}>
        <Sidebar activePage="settings" />
      </div>
      
      {/* Main content - adjusted margin to account for fixed sidebar */}
      <div className={`flex-1 flex flex-col ${isMobile ? '' : 'md:ml-64'} ${isMobile && sidebarOpen ? 'blur-sm' : ''}`}>
        {!isMobile && <DashboardHeader title="Settings" searchEnabled={false} filterEnabled={false} />}
        
        <div className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings 