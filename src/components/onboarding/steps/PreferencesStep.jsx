import React from 'react';

const PreferencesStep = ({ formData, onChange, onSubmit, isSubmitting }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <label className="block text-white mb-2" htmlFor="theme">
            Theme Preference
          </label>
          <select
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={onChange}
            className="w-full bg-[#18092a]/80 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00ff94]"
          >
            <option value="system">System Default</option>
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>

        <div>
          <label className="block text-white mb-4">
            Default Study Session Length (minutes)
          </label>
          <input
            type="range"
            id="defaultStudyTime"
            name="defaultStudyTime"
            min="5"
            max="60"
            step="5"
            value={formData.defaultStudyTime}
            onChange={onChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00ff94]"
          />
          <div className="flex justify-between mt-2 text-sm text-white/70">
            <span>5 min</span>
            <span className="text-[#00ff94] font-medium">{formData.defaultStudyTime} min</span>
            <span>60 min</span>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              checked={formData.emailNotifications}
              onChange={onChange}
              className="h-4 w-4 accent-[#00ff94]"
            />
            <label htmlFor="emailNotifications" className="ml-2 text-white">
              Email notifications
              <p className="text-sm text-white/60">
                Receive updates about your account and new features
              </p>
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="studyReminders"
              name="studyReminders"
              checked={formData.studyReminders}
              onChange={onChange}
              className="h-4 w-4 accent-[#00ff94]"
            />
            <label htmlFor="studyReminders" className="ml-2 text-white">
              Study reminders
              <p className="text-sm text-white/60">
                Get reminded when it's time to review your flashcards
              </p>
            </label>
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

export default PreferencesStep; 