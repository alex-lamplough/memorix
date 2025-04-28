import { useState } from 'react'

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex">
      <Sidebar activePage="favorites" />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          title="Favorites" 
          searchEnabled={true}
          filterEnabled={true}
        />
        
        <div className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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