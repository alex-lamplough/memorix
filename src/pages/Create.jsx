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
      <div className="md:hidden p-4 fixed top-0 left-0 z-20">
        <button onClick={() => setSidebarOpen(true)} className="text-white">
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>
      
      {/* Sidebar - hidden on mobile by default */}
      <div className={`
        ${isMobile ? 'fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out' : ''}
        ${isMobile && !sidebarOpen ? '-translate-x-full' : ''}
        ${isMobile && sidebarOpen ? 'translate-x-0' : ''}
      `}>
        <Sidebar activePage="create" />
        
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
      
      <div className={`flex-1 flex flex-col ${isMobile && sidebarOpen ? 'blur-sm' : ''}`}>
        {/* ... existing code ... */}
      </div>
    </div>
  );
}

export default Create; 