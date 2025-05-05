import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const DemoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#18092a] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-800/50">
        <div className="p-4 flex justify-between items-center border-b border-gray-800/50">
          <h2 className="text-xl font-bold text-white">Memorix Platform Demo</h2>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="aspect-video w-full bg-black relative overflow-hidden">
          <iframe 
            className="w-full h-full" 
            src="https://www.youtube.com/embed/v2K9JnaL0SU?autoplay=1" 
            title="Memorix Demo" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
        
        <div className="p-4 border-t border-gray-800/50 flex justify-between items-center">
          <p className="text-white/70 text-sm">© 2025 Memorix - All rights reserved</p>
          <button 
            onClick={onClose}
            className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoModal; 