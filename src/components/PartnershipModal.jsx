import React, { useState } from 'react';
import logger from '../../utils/logger';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const creatorTypes = [
  'Language Tutor',
  'Subject Tutor',
  'Content Creator',
  'Community Leader',
  'Other'
];

const contentTypes = [
  'Language Learning',
  'Academic Subjects',
  'Test Preparation',
  'Trivia & Games',
  'Professional Skills',
  'Hobby & Special Interest',
  'Fitness & Wellness',
  'Entertainment & Pop Culture',
  'Other'
];

const communitySizes = [
  '0-100',
  '101-500',
  '501-1000',
  '1001-5000',
  '5000+'
];

const PartnershipModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    creatorType: '',
    otherCreatorType: '',
    communitySize: '',
    contentType: [],
    platformLinks: {
      website: '',
      instagram: '',
      youtube: '',
      tiktok: '',
      other: ''
    },
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleContentTypeChange = (type) => {
    setFormData(prev => {
      const updated = {...prev};
      if (updated.contentType.includes(type)) {
        // Remove the type if it's already selected
        updated.contentType = updated.contentType.filter(t => t !== type);
      } else {
        // Add the type if it's not already selected
        updated.contentType = [...updated.contentType, type];
      }
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.creatorType) newErrors.creatorType = 'Please select your creator type';
    if (formData.creatorType === 'Other' && !formData.otherCreatorType.trim()) {
      newErrors.otherCreatorType = 'Please specify your creator type';
    }
    
    if (!formData.communitySize) newErrors.communitySize = 'Please select your community size';
    if (formData.contentType.length === 0) newErrors.contentType = 'Please select at least one content type';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await axios.post(`${API_URL}/partnerships`, formData);
      
      logger.debug('Partnership request submitted:', { value: response.data });
      setSubmitSuccess(true);
      
      // Reset form after short delay
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 3000);
      
    } catch (error) {
      logger.error('Error submitting partnership request:', error);
      setSubmitError(
        error.response?.data?.message || 
        'Failed to submit your request. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#18092a] rounded-xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-800/50 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#00ff94]/20 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#00ff94]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Application Submitted!</h2>
            <p className="text-white/70 mb-6">
              Thank you for your interest! We've received your application and will be in touch soon.
            </p>
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
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#18092a] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-800/50">
        <div className="p-4 flex justify-between items-center border-b border-gray-800/50">
          <h2 className="text-xl font-bold text-white">Partnership Application</h2>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-lg mb-4">
              {submitError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-1">
                  Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full bg-[#15052a] border ${errors.name ? 'border-red-500/50' : 'border-gray-800/50'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff94]/50`}
                  placeholder="Your full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              
              {/* Email Field */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-1">
                  Email*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full bg-[#15052a] border ${errors.email ? 'border-red-500/50' : 'border-gray-800/50'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff94]/50`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              {/* Creator Type */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-1">
                  Creator Type*
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {creatorTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'creatorType', value: type } })}
                      className={`px-3 py-2 rounded-lg text-center text-sm transition-all ${
                        formData.creatorType === type
                          ? 'bg-[#00ff94]/20 text-[#00ff94] border border-[#00ff94]/30'
                          : 'bg-[#15052a] text-white/70 border border-gray-800/50 hover:bg-[#15052a]/70'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {errors.creatorType && <p className="text-red-500 text-xs mt-1">{errors.creatorType}</p>}
                
                {/* Other Creator Type */}
                {formData.creatorType === 'Other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="otherCreatorType"
                      value={formData.otherCreatorType}
                      onChange={handleInputChange}
                      className={`w-full bg-[#15052a] border ${errors.otherCreatorType ? 'border-red-500/50' : 'border-gray-800/50'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff94]/50`}
                      placeholder="Please specify your creator type"
                    />
                    {errors.otherCreatorType && <p className="text-red-500 text-xs mt-1">{errors.otherCreatorType}</p>}
                  </div>
                )}
              </div>
              
              {/* Community Size */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-1">
                  Community Size*
                </label>
                <select
                  name="communitySize"
                  value={formData.communitySize}
                  onChange={handleInputChange}
                  className={`w-full bg-[#15052a] border ${errors.communitySize ? 'border-red-500/50' : 'border-gray-800/50'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff94]/50`}
                >
                  <option value="">Select your community size</option>
                  {communitySizes.map(size => (
                    <option key={size} value={size}>{size} followers/members</option>
                  ))}
                </select>
                {errors.communitySize && <p className="text-red-500 text-xs mt-1">{errors.communitySize}</p>}
              </div>
              
              {/* Content Types */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-1">
                  Content Types* (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {contentTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleContentTypeChange(type)}
                      className={`px-3 py-2 rounded-lg text-center text-sm transition-all ${
                        formData.contentType.includes(type)
                          ? 'bg-[#00ff94]/20 text-[#00ff94] border border-[#00ff94]/30'
                          : 'bg-[#15052a] text-white/70 border border-gray-800/50 hover:bg-[#15052a]/70'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {errors.contentType && <p className="text-red-500 text-xs mt-1">{errors.contentType}</p>}
              </div>
              
              {/* Platform Links */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-1">
                  Platform Links (optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="platformLinks.website"
                    value={formData.platformLinks.website}
                    onChange={handleInputChange}
                    className="w-full bg-[#15052a] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff94]/50"
                    placeholder="Website URL"
                  />
                  <input
                    type="text"
                    name="platformLinks.instagram"
                    value={formData.platformLinks.instagram}
                    onChange={handleInputChange}
                    className="w-full bg-[#15052a] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff94]/50"
                    placeholder="Instagram profile"
                  />
                  <input
                    type="text"
                    name="platformLinks.youtube"
                    value={formData.platformLinks.youtube}
                    onChange={handleInputChange}
                    className="w-full bg-[#15052a] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff94]/50"
                    placeholder="YouTube channel"
                  />
                  <input
                    type="text"
                    name="platformLinks.tiktok"
                    value={formData.platformLinks.tiktok}
                    onChange={handleInputChange}
                    className="w-full bg-[#15052a] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff94]/50"
                    placeholder="TikTok profile"
                  />
                  <input
                    type="text"
                    name="platformLinks.other"
                    value={formData.platformLinks.other}
                    onChange={handleInputChange}
                    className="w-full bg-[#15052a] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff94]/50"
                    placeholder="Other platforms or links"
                  />
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-1">
                  Tell us more about your content and community (optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-[#15052a] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff94]/50 min-h-[100px]"
                  placeholder="What kind of content do you create? What makes your community unique? How do you plan to use Memorix?"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 border border-white/30 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/10"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-[#00ff94] text-[#18092a] px-6 py-2 rounded-lg font-medium flex items-center 
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00ff94]/80'}`}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Submitting...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-[#18092a] border-t-transparent rounded-full"></div>
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartnershipModal; 