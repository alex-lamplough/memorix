import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import CheckoutButton from './CheckoutButton';

/**
 * Modal component that prompts users to upgrade when they try to access pro features
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.feature - Name of the feature being restricted
 * @param {string} props.featureDescription - Description of the feature
 */
const FeatureUpgradeModal = ({ 
  isOpen, 
  onClose, 
  feature = 'this feature', 
  featureDescription = 'Access premium features and remove limitations'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#18092a] rounded-xl max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-white">Upgrade Required</h2>
            <button 
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <CloseIcon />
            </button>
          </div>
          
          <div className="mb-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-[#00ff94]/10 rounded-full flex items-center justify-center border border-[#00ff94]/30 mb-4">
              <LockIcon style={{ fontSize: 40 }} className="text-[#00ff94]" />
            </div>
            <p className="text-white/80 text-center mb-2">
              <span className="text-[#00ff94] font-bold">{feature}</span> is available on our Pro plan.
            </p>
            <p className="text-white/70 text-center text-sm">
              {featureDescription}
            </p>
          </div>
          
          <div className="bg-[#15052a] p-4 rounded-lg border border-gray-800/50 mb-6">
            <h3 className="font-semibold text-white mb-2">Pro Plan includes:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ff94] mt-1.5 mr-2"></span>
                <span className="text-white/80">Unlimited Flashcard & Quiz creation</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ff94] mt-1.5 mr-2"></span>
                <span className="text-white/80">Advanced Analytics</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ff94] mt-1.5 mr-2"></span>
                <span className="text-white/80">Priority Support</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ff94] mt-1.5 mr-2"></span>
                <span className="text-white/80">And much more</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <CheckoutButton
              plan="pro"
              text="Upgrade to Pro - £9.99/month"
              className="bg-[#00ff94] text-[#18092a] font-medium px-4 py-3 rounded-lg hover:bg-[#00ff94]/90 transition-colors w-full"
            />
            
            <button 
              onClick={onClose}
              className="bg-transparent text-white border border-white/30 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureUpgradeModal; 