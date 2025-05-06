import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setPageTitle } from '../utils/title-utils';
import logoGreen from '../assets/MemorixLogoGreen.png';
import facebookLogo from '../assets/facebookLogo.png';
import instagramLogo from '../assets/instagramLogo.png';
import xLogo from '../assets/xLogo.png';

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
      
      {/* Footer matching the main app */}
      <footer className="py-8 border-t border-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="flex items-center mb-4 md:mb-0 gap-6">
              <Link to="/">
                <img src={logoGreen} alt="Memorix" className="h-8 w-auto" />
              </Link>
              <div className="flex items-center gap-3">
                <a href="https://facebook.com/memorixapp" target="_blank" rel="noopener noreferrer" 
                  className="hover:opacity-80 transition-opacity">
                  <img src={facebookLogo} alt="Facebook" className="h-5 w-auto" />
                </a>
                <a href="https://instagram.com/memorixapp" target="_blank" rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity">
                  <img src={instagramLogo} alt="Instagram" className="h-5 w-auto" />
                </a>
                <a href="https://x.com/memorixapp" target="_blank" rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity">
                  <img src={xLogo} alt="X" className="h-5 w-auto" />
                </a>
              </div>
            </div>
            
            <div className="flex space-x-8">
              <Link to="/" className="text-white/70 hover:text-[#00ff94] transition-colors text-sm">Home</Link>
              <Link to="/privacy" className={`text-white/70 hover:text-[#00ff94] transition-colors text-sm ${title === 'Privacy Policy' ? 'text-[#00ff94]' : ''}`}>Privacy</Link>
              <Link to="/terms" className={`text-white/70 hover:text-[#00ff94] transition-colors text-sm ${title === 'Terms of Service' ? 'text-[#00ff94]' : ''}`}>Terms</Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800/30 pt-6 text-center">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} Readler Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout; 