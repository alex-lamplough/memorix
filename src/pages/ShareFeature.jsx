import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import FilterListIcon from '@mui/icons-material/FilterList';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Mock data for demonstration - replace with actual API calls
const mockSharedContent = [
  {
    id: '1',
    type: 'flashcards',
    title: 'Spanish Vocabulary',
    description: 'Basic Spanish vocabulary for beginners',
    author: 'Maria Garcia',
    dateShared: '2023-05-10',
    views: 1245,
    favorites: 89,
    cardCount: 50,
    tags: ['Language', 'Spanish', 'Beginner']
  },
  {
    id: '2',
    type: 'quiz',
    title: 'World History Quiz',
    description: 'Test your knowledge of major historical events',
    author: 'History Buff',
    dateShared: '2023-06-15',
    views: 982,
    favorites: 67,
    questionCount: 20,
    tags: ['History', 'World', 'Advanced']
  },
  {
    id: '3',
    type: 'flashcards',
    title: 'React Hooks Reference',
    description: 'Complete guide to React Hooks with examples',
    author: 'JS Developer',
    dateShared: '2023-07-20',
    views: 3578,
    favorites: 241,
    cardCount: 35,
    tags: ['Programming', 'React', 'Web Development']
  },
  {
    id: '4',
    type: 'quiz',
    title: 'Anatomy Basics',
    description: 'Quiz on human body systems and functions',
    author: 'Medical Student',
    dateShared: '2023-08-05',
    views: 842,
    favorites: 53,
    questionCount: 30,
    tags: ['Medicine', 'Anatomy', 'Biology']
  },
];

const ShareFeature = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteItems, setFavoriteItems] = useState({});
  const [filteredContent, setFilteredContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call
    const fetchSharedContent = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        setTimeout(() => {
          setFilteredContent(mockSharedContent);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch shared content:', error);
        setError('Failed to load shared content. Please try again later.');
        setLoading(false);
      }
    };

    fetchSharedContent();
  }, []);

  useEffect(() => {
    if (!loading) {
      const filtered = mockSharedContent.filter(item => {
        // Filter based on tab (All, Flashcards, Quizzes)
        if (activeTab === 'flashcards' && item.type !== 'flashcards') return false;
        if (activeTab === 'quizzes' && item.type !== 'quiz') return false;
        
        // Filter based on search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.author.toLowerCase().includes(query) ||
            item.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }
        
        return true;
      });
      
      setFilteredContent(filtered);
    }
  }, [activeTab, searchQuery, loading]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const toggleFavorite = (itemId) => {
    setFavoriteItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleCopyShareLink = (item) => {
    const shareUrl = `${window.location.origin}/share/${item.type}/${item.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch((error) => {
        console.error('Failed to copy: ', error);
      });
  };
  
  const handleViewItem = (item) => {
    navigate(`/share/${item.type}/${item.id}`);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white animate-pulse">
              <div className="h-6 bg-white/10 rounded w-3/5 mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-4/5 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-2/5 mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-white/10 rounded w-16"></div>
                <div className="h-6 bg-white/10 rounded w-20"></div>
              </div>
              <div className="flex gap-2 mt-6">
                <div className="h-10 bg-white/10 rounded flex-1"></div>
                <div className="h-10 bg-white/10 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30">
          {error}
        </div>
      );
    }

    if (filteredContent.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-xl font-bold text-white mb-2">No shared content found</h3>
          <p className="text-white/70 text-sm">
            Try adjusting your search or filters
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div 
            key={item.id}
            className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white flex flex-col h-full"
          >
            <div className="flex items-center mb-2">
              <div className="p-1.5 bg-[#00ff94]/10 rounded-md mr-2">
                {item.type === 'flashcards' 
                  ? <SchoolIcon className="text-[#00ff94]" fontSize="small" /> 
                  : <QuizIcon className="text-[#00ff94]" fontSize="small" />
                }
              </div>
              <span className="text-white/70 text-sm">
                {item.type === 'flashcards' ? 'Flashcards' : 'Quiz'}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            
            <p className="text-white/70 text-sm mb-3">
              {item.description}
            </p>
            
            <p className="text-white/60 text-sm mb-4">
              By: {item.author} • Shared: {new Date(item.dateShared).toLocaleDateString()}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-[#00ff94]/10 text-[#00ff94] text-xs px-2.5 py-1 rounded-md hover:bg-[#00ff94]/20 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-4 mb-4 mt-auto">
              <div className="flex items-center">
                <VisibilityIcon className="text-white/50 mr-1" fontSize="small" />
                <span className="text-white/70 text-xs">{item.views}</span>
              </div>
              <div className="flex items-center">
                <StarIcon className="text-white/50 mr-1" fontSize="small" />
                <span className="text-white/70 text-xs">{item.favorites}</span>
              </div>
              <span className="text-white/70 text-xs">
                {item.type === 'flashcards' 
                  ? `${item.cardCount} cards` 
                  : `${item.questionCount} questions`}
              </span>
            </div>
            
            <div className="flex gap-2 mt-2">
              <button 
                className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex items-center gap-1 flex-1"
                onClick={() => handleViewItem(item)}
              >
                <VisibilityIcon fontSize="small" />
                <span>Study</span>
              </button>
              <button 
                className="bg-[#18092a]/60 text-white p-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors"
                onClick={() => handleCopyShareLink(item)}
                title="Copy link"
              >
                <ContentCopyIcon fontSize="small" />
              </button>
              <button 
                className={`bg-[#18092a]/60 p-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors ${
                  favoriteItems[item.id] ? 'text-[#00ff94]' : 'text-white/50 hover:text-white'
                }`}
                onClick={() => toggleFavorite(item.id)}
                title={favoriteItems[item.id] ? "Remove from favorites" : "Add to favorites"}
              >
                {favoriteItems[item.id] ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f]">
      <div className="container mx-auto px-4 py-8">
        <div className="py-4 md:py-6 border-b border-gray-800/30 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center mr-4 text-white/70 hover:text-[#00ff94] transition-colors"
              >
                <ArrowBackIcon fontSize="small" className="mr-1" />
                <span>Back</span>
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Shared Content</h1>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  placeholder="Search by title, author, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#18092a]/60 text-white rounded-lg pl-10 pr-3 py-2 border border-gray-800/30 text-sm focus:outline-none focus:border-[#00ff94]/50 w-full sm:w-64"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" fontSize="small" />
              </div>
              <button className="bg-[#18092a]/60 text-white p-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors">
                <FilterListIcon fontSize="small" />
              </button>
              <Link 
                to="/" 
                className="bg-[#18092a]/60 text-white p-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors"
                title="Home"
              >
                <HomeIcon fontSize="small" />
              </Link>
            </div>
          </div>
        </div>
        
        <p className="text-white/70 text-sm mb-6">
          Discover and study flashcards and quizzes shared by the Memorix community.
        </p>
        
        <div className="flex border-b border-gray-800/30 mb-8">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 text-sm font-medium relative ${
              activeTab === 'all' 
                ? 'text-[#00ff94]' 
                : 'text-white/70 hover:text-white/90'
            }`}
          >
            All
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00ff94]"></div>
            )}
          </button>
          <button
            onClick={() => handleTabChange('flashcards')}
            className={`px-4 py-2 text-sm font-medium relative ${
              activeTab === 'flashcards' 
                ? 'text-[#00ff94]' 
                : 'text-white/70 hover:text-white/90'
            }`}
          >
            Flashcards
            {activeTab === 'flashcards' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00ff94]"></div>
            )}
          </button>
          <button
            onClick={() => handleTabChange('quizzes')}
            className={`px-4 py-2 text-sm font-medium relative ${
              activeTab === 'quizzes' 
                ? 'text-[#00ff94]' 
                : 'text-white/70 hover:text-white/90'
            }`}
          >
            Quizzes
            {activeTab === 'quizzes' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00ff94]"></div>
            )}
          </button>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default ShareFeature; 