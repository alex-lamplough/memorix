import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { MenuIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';

function Create() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, sidebarOpen]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex flex-col md:flex-row">
      {/* Mobile menu button */}
      {isMobile && (
        <div className="p-4 flex items-center justify-end sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white rounded-lg hover:bg-white/10"
          >
            <MenuIcon className="h-6 w-6" />
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
        <Sidebar activePage="create" />
      </div>
      
      <div className={`flex-1 flex flex-col ${isMobile ? '' : 'md:ml-64'} ${isMobile && sidebarOpen ? 'blur-sm' : ''}`}>
        {/* ... existing code ... */}
      </div>
    </div>
  );
}

export default Create; 