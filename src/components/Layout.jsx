import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { setPageTitle } from '../utils/title-utils';

/**
 * Layout component that provides a consistent layout for authenticated pages
 * It includes the sidebar, header, and content area with a shared background
 */
function Layout({ children, title, activePage, showHeader = true, searchEnabled = false, filterEnabled = false, actionButton = null, onActionButtonClick = null }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Set the page title when the component mounts or title changes
  useEffect(() => {
    setPageTitle(title);
  }, [title]);
  
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
        <Sidebar activePage={activePage} transparentBg={true} />
      </div>
      
      {/* Main content - adjusted margin to account for fixed sidebar */}
      <div className={`flex-1 flex flex-col ${isMobile ? '' : 'md:ml-64'} ${isMobile && sidebarOpen ? 'blur-sm' : ''}`}>
        {showHeader && !isMobile && (
          <DashboardHeader 
            title={title} 
            searchEnabled={searchEnabled}
            filterEnabled={filterEnabled}
            actionButton={actionButton}
            onActionButtonClick={onActionButtonClick}
            transparentBg={true}
          />
        )}
        
        <div className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            {isMobile && showHeader && (
              <div className="mb-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                {actionButton && (
                  <button 
                    className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1.5 text-sm rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex items-center gap-1"
                    onClick={onActionButtonClick}
                  >
                    <span>{actionButton}</span>
                  </button>
                )}
              </div>
            )}
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout; 