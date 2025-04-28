import { useState } from 'react'

// Icons
import FlipIcon from '@mui/icons-material/Flip'

function Flashcard({ question, answer, isFlipped, onFlip }) {
  return (
    <div 
      className="w-full max-w-lg mx-auto h-64 cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Question side */}
        <div className={`absolute inset-0 bg-[#18092a]/80 border border-[#00ff94]/30 rounded-xl p-6 shadow-lg backface-hidden ${isFlipped ? 'hidden' : 'block'}`}>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white mb-4">Question</h3>
            <FlipIcon className="text-[#00ff94]" />
          </div>
          <p className="text-white/90 text-center mt-6 text-lg">{question}</p>
        </div>
        
        {/* Answer side */}
        <div className={`absolute inset-0 bg-[#18092a]/80 border border-[#00ff94]/30 rounded-xl p-6 shadow-lg backface-hidden rotate-y-180 ${isFlipped ? 'block' : 'hidden'}`}>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white mb-4">Answer</h3>
            <FlipIcon className="text-[#00ff94]" />
          </div>
          <p className="text-white/90 text-center mt-6 text-lg">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default Flashcard 