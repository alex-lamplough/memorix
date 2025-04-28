import { useState } from 'react'
import Flashcard from './Flashcard'

function FlashcardDeck({ flashcards }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }
  
  const nextCard = () => {
    setIsFlipped(false) // Reset to question side
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length)
  }
  
  const prevCard = () => {
    setIsFlipped(false) // Reset to question side
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length)
  }
  
  return (
    <div className="w-full max-w-lg mx-auto">
      <Flashcard
        question={flashcards[currentCardIndex].question}
        answer={flashcards[currentCardIndex].answer}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />
      
      <div className="flex justify-between mt-4">
        <button 
          onClick={prevCard}
          className="bg-[#18092a]/60 text-white px-4 py-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors"
        >
          Previous
        </button>
        <div className="text-white">
          {currentCardIndex + 1} / {flashcards.length}
        </div>
        <button 
          onClick={nextCard}
          className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg border border-[#00ff94]/30 hover:bg-[#00ff94]/20 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default FlashcardDeck 