import React, { useState } from 'react';

// Suggested interests and learning goals
const SUGGESTED_INTERESTS = [
  'Languages', 'Science', 'Math', 'History', 'Literature',
  'Programming', 'Music', 'Art', 'Medicine', 'Law',
  'Business', 'Psychology', 'Philosophy', 'Economics', 'Engineering',
  'Just For Fun'
];

const SUGGESTED_GOALS = [
  'Pass an exam', 'Learn a new language', 'Improve knowledge', 
  'Career advancement', 'Personal interest', 'Academic research',
  'Teaching others', 'Memory improvement', 'Certification',
  'Just for a laugh', 'Kill some time', 'Impress my friends', 
  'Learn something random', 'Beat my own high score'
];

const InterestsStep = ({ formData, onChange, onArrayChange, onSubmit, isSubmitting }) => {
  const [customInterest, setCustomInterest] = useState('');
  const [customGoal, setCustomGoal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const toggleInterest = (interest) => {
    const currentInterests = [...formData.interests];
    if (currentInterests.includes(interest)) {
      onArrayChange('interests', currentInterests.filter(i => i !== interest));
    } else {
      onArrayChange('interests', [...currentInterests, interest]);
    }
  };

  const toggleGoal = (goal) => {
    const currentGoals = [...formData.learningGoals];
    if (currentGoals.includes(goal)) {
      onArrayChange('learningGoals', currentGoals.filter(g => g !== goal));
    } else {
      onArrayChange('learningGoals', [...currentGoals, goal]);
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !formData.interests.includes(customInterest.trim())) {
      onArrayChange('interests', [...formData.interests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const addCustomGoal = () => {
    if (customGoal.trim() && !formData.learningGoals.includes(customGoal.trim())) {
      onArrayChange('learningGoals', [...formData.learningGoals, customGoal.trim()]);
      setCustomGoal('');
    }
  };

  const handleKeyPress = (e, addFunction) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFunction();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-white mb-3">What topics are you interested in?</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTED_INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  formData.interests.includes(interest)
                    ? 'bg-[#00ff94] text-[#18092a] font-medium'
                    : 'bg-[#18092a]/80 text-white/70 border border-gray-700 hover:bg-[#18092a]'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addCustomInterest)}
              className="flex-1 bg-[#18092a]/80 text-white border border-gray-700 rounded-l-lg px-4 py-2 focus:outline-none focus:border-[#00ff94]"
              placeholder="Add a custom interest..."
            />
            <button
              type="button"
              onClick={addCustomInterest}
              disabled={!customInterest.trim()}
              className={`bg-[#00ff94]/20 text-[#00ff94] px-4 py-2 rounded-r-lg border border-[#00ff94]/30 
                ${!customInterest.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00ff94]/30'}`}
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-white mb-3">What are your learning goals?</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTED_GOALS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  formData.learningGoals.includes(goal)
                    ? 'bg-[#00ff94] text-[#18092a] font-medium'
                    : 'bg-[#18092a]/80 text-white/70 border border-gray-700 hover:bg-[#18092a]'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addCustomGoal)}
              className="flex-1 bg-[#18092a]/80 text-white border border-gray-700 rounded-l-lg px-4 py-2 focus:outline-none focus:border-[#00ff94]"
              placeholder="Add a custom goal..."
            />
            <button
              type="button"
              onClick={addCustomGoal}
              disabled={!customGoal.trim()}
              className={`bg-[#00ff94]/20 text-[#00ff94] px-4 py-2 rounded-r-lg border border-[#00ff94]/30 
                ${!customGoal.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00ff94]/30'}`}
            >
              Add
            </button>
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="border border-white/30 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/10"
          >
            Back
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-[#00ff94] text-[#18092a] px-6 py-2 rounded-lg font-medium flex items-center 
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00ff94]/80'}`}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Saving...</span>
                <div className="animate-spin h-4 w-4 border-2 border-[#18092a] border-t-transparent rounded-full"></div>
              </>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default InterestsStep; 