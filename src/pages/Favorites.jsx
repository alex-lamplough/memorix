import { useState } from 'react'
import { useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import FlashcardSet from '../components/FlashcardSet'

function Favorites() {
  const [favoriteSets] = useState([
    {
      id: 1,
      title: 'Physics Fundamentals',
      cards: 24,
      lastStudied: 'Today',
      progress: 75
    },
    {
      id: 2,
      title: 'Spanish Vocabulary',
      cards: 48,
      lastStudied: 'Yesterday',
      progress: 45
    },
    {
      id: 3,
      title: 'Web Development',
      cards: 32,
      lastStudied: '3 days ago',
      progress: 90
    }
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex flex-col md:flex-row">
      {/* Mobile menu button */}
      {isMobile && (
        <div className="bg-[#18092a]/80 p-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-widest text-[#00ff94]">M/</span>
            <span className="text-white font-bold">Memorix</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white rounded-lg bg-[#18092a] hover:bg-[#18092a]/80"
          >
            <MenuIcon />
          </button>
        </div>
      )}
      
      {/* Sidebar - hidden on mobile by default */}
      <div className={`
        ${isMobile ? 'fixed inset-0 z-20 transform transition-transform duration-300 ease-in-out' : ''}
        ${isMobile && !sidebarOpen ? '-translate-x-full' : ''}
        ${isMobile && sidebarOpen ? 'translate-x-0' : ''}
      `}>
        <Sidebar activePage="favorites" />
        
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col">
        {!isMobile && (
          <DashboardHeader 
            title="Favorites" 
            searchEnabled={true}
            filterEnabled={true}
          />
        )}
        
        <div className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            {isMobile && (
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Favorites</h1>
                <div className="flex gap-2">
                  <button className="p-2 text-white rounded-lg bg-[#18092a]/60 border border-gray-800/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                  <button className="p-2 text-white rounded-lg bg-[#18092a]/60 border border-gray-800/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {favoriteSets.map(set => (
                <FlashcardSet 
                  key={set.id}
                  title={set.title}
                  cards={set.cards}
                  lastStudied={set.lastStudied}
                  progress={set.progress}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Favorites 