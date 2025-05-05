import React from 'react';

const BasicInfoStep = ({ formData, onChange, onSubmit, isSubmitting }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <label className="block text-white mb-2" htmlFor="displayName">
            Display Name*
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={onChange}
            required
            className="w-full bg-[#18092a]/80 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00ff94]"
            placeholder="How would you like to be known?"
          />
        </div>

        <div>
          <label className="block text-white mb-2" htmlFor="bio">
            Bio <span className="text-white/50 text-sm">(optional)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={onChange}
            rows="3"
            className="w-full bg-[#18092a]/80 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00ff94]"
            placeholder="Tell us a bit about yourself..."
          ></textarea>
        </div>

        <div>
          <label className="block text-white mb-3" htmlFor="userType">
            What best describes you?*
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['Student', 'Educator', 'Creator', 'General User'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ target: { name: 'userType', value: type } })}
                className={`px-4 py-3 rounded-lg text-center transition-all ${
                  formData.userType === type
                    ? 'bg-[#00ff94] text-[#18092a] font-medium'
                    : 'bg-[#18092a]/80 text-white/70 border border-gray-700 hover:bg-[#18092a]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !formData.displayName || !formData.userType}
            className={`bg-[#00ff94] text-[#18092a] px-6 py-2 rounded-lg font-medium flex items-center 
              ${(isSubmitting || !formData.displayName || !formData.userType) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00ff94]/80'}`}
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

export default BasicInfoStep; 