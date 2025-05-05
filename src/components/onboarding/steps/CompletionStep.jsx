import React from 'react';
import onboardingComplete from '../../../assets/onboarding-complete.png';

const CompletionStep = ({ formData, onSubmit, isSubmitting }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center py-4">
          <div className="mb-6">
            <img 
              src={onboardingComplete} 
              alt="Onboarding Complete" 
              className="w-40 h-40 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold mb-2">Profile Setup Complete!</h2>
          <p className="text-white/70 max-w-lg mb-6">
            Thanks for completing your profile, {formData.displayName}! Your personalized learning experience is ready.
          </p>
          
          <div className="bg-[#18092a]/80 rounded-lg p-6 w-full max-w-lg border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Your Profile Summary</h3>
            
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <h4 className="text-white/50 text-sm">Display Name</h4>
                <p className="text-white">{formData.displayName}</p>
              </div>
              
              {formData.userType && (
                <div>
                  <h4 className="text-white/50 text-sm">User Type</h4>
                  <p className="text-white">{formData.userType}</p>
                </div>
              )}
            </div>
            
            {formData.bio && (
              <div className="mt-4 text-left">
                <h4 className="text-white/50 text-sm">Bio</h4>
                <p className="text-white">{formData.bio}</p>
              </div>
            )}
            
            {formData.interests.length > 0 && (
              <div className="mt-4 text-left">
                <h4 className="text-white/50 text-sm">Interests</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.interests.map(interest => (
                    <span
                      key={interest}
                      className="bg-[#00ff94]/10 text-[#00ff94] text-xs px-2.5 py-1 rounded-md"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {formData.learningGoals.length > 0 && (
              <div className="mt-4 text-left">
                <h4 className="text-white/50 text-sm">Learning Goals</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.learningGoals.map(goal => (
                    <span
                      key={goal}
                      className="bg-white/10 text-white/90 text-xs px-2.5 py-1 rounded-md"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-[#00ff94] text-[#18092a] px-8 py-3 rounded-lg font-medium flex items-center 
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00ff94]/80'}`}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Finalizing...</span>
                <div className="animate-spin h-4 w-4 border-2 border-[#18092a] border-t-transparent rounded-full"></div>
              </>
            ) : (
              'Start Using Memorix'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CompletionStep; 