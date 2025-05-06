import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setPageTitle } from '../utils/title-utils';
import logoGreen from '../assets/MemorixLogoGreen.png';

/**
 * PublicLayout component that provides a layout for public pages
 * without authentication requirements
 */
function PublicLayout({ children, title }) {
  // Set the page title when the component mounts or title changes
  useEffect(() => {
    setPageTitle(title);
  }, [title]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white">
      {/* Simple header with logo */}
      <header className="py-6 border-b border-gray-800/30">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logoGreen} alt="Memorix" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="text-white/70 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/privacy" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link 
              to="/terms" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="py-12">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      
      {/* Simple footer */}
      <footer className="py-8 border-t border-gray-800/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Readler Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout; 