import { useState, useEffect, useRef } from 'react'
import { useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import { useAuth0 } from '@auth0/auth0-react'

// Custom hooks
import useNavigationWithCancellation from '../hooks/useNavigationWithCancellation'

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import ShareModal from '../components/ShareModal'
import FlashcardCreationModal from '../components/FlashcardCreationModal'

// Icons
import ShareIcon from '@mui/icons-material/Share'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'

// Services
import { flashcardService } from '../services/api'
import { handleRequestError } from '../services/utils'

function FlashcardCard({ title, cards, lastStudied, progress, id, onDelete, isFavorite = false, onToggleFavorite }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);
  const navigate = useNavigationWithCancellation();
  
  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    try {
      const newFavoriteStatus = !favorite;
      setFavorite(newFavoriteStatus);
      
      // Call the API to update the favorite status
      await flashcardService.toggleFavorite(id, newFavoriteStatus);
      
      // If there's a parent callback, invoke it
      if (onToggleFavorite) {
        onToggleFavorite(id, newFavoriteStatus);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert the UI state on error
      setFavorite(favorite);
    }
  };
  
  const handleStudyClick = () => {
    navigate(`/study/${id}`);
  }
  
  const handleEditClick = () => {
    navigate(`/edit/${id}`);
  }
  
  const handleShareClick = () => {
    setIsShareModalOpen(true);
  }
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  }
  
  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      // Call API to delete the flashcard set
      await flashcardService.deleteFlashcardSet(id);
      setIsDeleting(false);
      
      // Call the parent component's onDelete function to update the UI
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      setIsDeleting(false);
    }
    setShowDeleteConfirm(false);
  }
  
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold truncate pr-2">{title}</h3>
        <div className="flex space-x-1">
          <button 
            onClick={handleToggleFavorite}
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
            title={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            {favorite ? 
              <StarIcon className="text-[#FFD700]" fontSize="small" /> : 
              <StarBorderIcon className="text-white/60 hover:text-white" fontSize="small" />
            }
          </button>
          <button 
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
            onClick={handleShareClick}
            title="Share"
          >
            <ShareIcon fontSize="small" />
          </button>
          <button 
            className="text-white/60 hover:text-red-400 p-1 rounded-full hover:bg-white/10"
            onClick={handleDeleteClick}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>
      
      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#18092a] p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-3">Delete Flashcard Set</h3>
            <p className="text-white/70 mb-6">Are you sure you want to delete "{title}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Share modal */}
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemToShare={{
          id,
          type: "flashcards",
          title
        }}
      />
      
      <div className="mb-4">
        <span className="text-white/70 text-sm">
          {cards} {cards === 1 ? 'card' : 'cards'}
        </span>
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00ff94]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="text-white/70 text-sm mb-5 flex items-center gap-1">
        <AccessTimeIcon fontSize="small" />
        <span>Last studied: {lastStudied}</span>
      </div>
      
      <div className="flex gap-2">
        <button 
          className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex-1"
          onClick={handleStudyClick}
        >
          Study
        </button>
        <button 
          className="bg-[#18092a]/60 text-white px-4 py-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors"
          onClick={handleEditClick}
        >
          Edit
        </button>
      </div>
    </div>
  )
}

function Flashcards() {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [filteredSets, setFilteredSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastStudied');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const isMountedRef = useRef(true);
  const controllerRef = useRef(null);
  const fetchTimeoutRef = useRef(null);
  const filterMenuRef = useRef(null);
  const { user } = useAuth0();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Fetch user's flashcard sets
  const fetchFlashcardSets = async () => {
    if (!isMountedRef.current) return;
    
    // Cancel any ongoing request
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    
    // Create new controller for this request
    controllerRef.current = new AbortController();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Use a timeout to prevent long-running requests
      const timeoutId = setTimeout(() => {
        if (controllerRef.current) {
          controllerRef.current.abort();
          if (isMountedRef.current) {
            setError('Request timed out. Please try again.');
            setIsLoading(false);
          }
        }
      }, 15000); // 15 second timeout
      
      const response = await flashcardService.getAllFlashcardSets();
      
      // Clear the timeout since request completed
      clearTimeout(timeoutId);
      
      // Guard against setting state on unmounted component
      if (!isMountedRef.current) return;
      
      console.log('Fetched flashcard sets:', response);
      
      // Transform data to match our component requirements if needed
      const transformedSets = response.map(set => ({
        id: set._id,
        title: set.title,
        cards: set.cardCount || 0,
        lastStudied: set.lastStudied ? new Date(set.lastStudied) : null,
        lastStudiedFormatted: formatLastStudied(set.lastStudied),
        progress: set.progress || 0,
        createdAt: new Date(set.createdAt || Date.now()),
        favorite: set.isFavorite || false // Use isFavorite property from API response
      }));
      
      if (isMountedRef.current) {
        setFlashcardSets(transformedSets);
        applyFiltersAndSort(transformedSets);
      }
    } catch (err) {
      // Only log and update state for non-cancellation errors
      if (!handleRequestError(err, 'Flashcards fetch')) {
        console.error('Error fetching flashcard sets:', err);
        if (isMountedRef.current) {
          setError('Failed to load your flashcard sets. Please try again later.');
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };
  
  // Apply search, filters and sorting
  const applyFiltersAndSort = (sets = flashcardSets) => {
    if (!sets || !sets.length) return;
    
    // First apply search filter
    let result = sets;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(set => 
        set.title.toLowerCase().includes(query)
      );
    }
    
    // Then sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return sortOrder === 'asc' 
            ? a.title.localeCompare(b.title) 
            : b.title.localeCompare(a.title);
          
        case 'progress':
          return sortOrder === 'asc' 
            ? a.progress - b.progress 
            : b.progress - a.progress;
          
        case 'cards':
          return sortOrder === 'asc' 
            ? a.cards - b.cards 
            : b.cards - a.cards;
          
        case 'createdAt':
          const dateA1 = a.createdAt || new Date(0);
          const dateB1 = b.createdAt || new Date(0);
          return sortOrder === 'asc' 
            ? dateA1 - dateB1 
            : dateB1 - dateA1;
          
        case 'lastStudied':
        default:
          const dateA = a.lastStudied || new Date(0);
          const dateB = b.lastStudied || new Date(0);
          return sortOrder === 'asc' 
            ? dateA - dateB 
            : dateB - dateA;
      }
    });
    
    setFilteredSets(result);
  };
  
  // Apply filters whenever search or sort options change
  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, sortBy, sortOrder]);
  
  // Format the last studied date in a user-friendly way
  const formatLastStudied = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Check if it's today
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle sort options
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle order if clicking on same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortBy(field);
      setSortOrder('desc');
    }
    setShowFilterDropdown(false);
  };
  
  // Get sort icon direction
  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    
    return sortOrder === 'asc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
      </svg>
    );
  };
  
  // Debounced version of fetchFlashcardSets to prevent multiple calls
  const debouncedFetchFlashcardSets = () => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Set a new timeout
    fetchTimeoutRef.current = setTimeout(() => {
      fetchFlashcardSets();
    }, 50); // Short delay of 50ms
  };
  
  // Initialize the isMounted ref and fetch flashcard sets on component mount
  useEffect(() => {
    isMountedRef.current = true;
    debouncedFetchFlashcardSets();
    
    return () => {
      isMountedRef.current = false;
      // Cancel any pending requests when component unmounts
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);
  
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  }
  
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    // Refresh flashcards
    debouncedFetchFlashcardSets();
  }
  
  // Handle flashcard set deletion
  const handleFlashcardDeleted = (flashcardId) => {
    const updatedSets = flashcardSets.filter(set => set.id !== flashcardId);
    setFlashcardSets(updatedSets);
    applyFiltersAndSort(updatedSets);
  }
  
  // Handle flashcard favorite toggle
  const handleToggleFavorite = (id, isFavorite) => {
    // Update state to reflect the new favorite status
    setFlashcardSets(prevSets => 
      prevSets.map(set => 
        set.id === id ? { ...set, favorite: isFavorite } : set
      )
    );
    
    // Also update filtered sets
    setFilteredSets(prevSets => 
      prevSets.map(set => 
        set.id === id ? { ...set, favorite: isFavorite } : set
      )
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex flex-col md:flex-row">
      {/* Mobile menu button */}
      {isMobile && (
        <div className="p-4 flex items-center justify-end sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white rounded-lg hover:bg-white/10"
          >
            <MenuIcon />
          </button>
        </div>
      )}
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar - fixed position on desktop, overlay on mobile */}
      <div className={`fixed top-0 left-0 bottom-0 w-64 transform transition-transform duration-300 ease-in-out z-40 ${isMobile && !sidebarOpen ? '-translate-x-full' : ''} ${isMobile && sidebarOpen ? 'translate-x-0' : ''}`}>
        <Sidebar activePage="flashcards" />
      </div>
      
      {/* Main content - adjusted margin to account for fixed sidebar */}
      <div className={`flex-1 flex flex-col ${isMobile ? '' : 'md:ml-64'} ${isMobile && sidebarOpen ? 'blur-sm' : ''}`}>
        {!isMobile && (
          <DashboardHeader
            title="My Flashcards" 
            actionButton="Create Flashcards"
            onActionButtonClick={handleOpenCreateModal}
          />
        )}
        
        <div className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            {isMobile && (
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Flashcards</h1>
                <div className="flex gap-2">
                  <button 
                    className="p-2 text-white rounded-lg bg-[#18092a]/60 border border-gray-800/30"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                  </button>
                  <button 
                    className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex items-center gap-1"
                    onClick={handleOpenCreateModal}
                  >
                    <AddCircleOutlineIcon fontSize="small" />
                    <span>Create</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Search and filter bar */}
            <div className="bg-[#18092a]/60 rounded-xl p-4 mb-6 border border-gray-800/30 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-2/3">
                <input
                  type="text"
                  placeholder="Search flashcards..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-[#15052a]/80 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative ml-auto" ref={filterMenuRef}>
                  <button 
                    className="flex items-center gap-1 bg-[#15052a]/80 px-3 py-2 rounded-lg border border-gray-800/50 hover:bg-[#15052a] transition-colors"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <span className="text-white/80">Sort by: </span>
                    <span className="text-white font-medium">
                      {sortBy === 'lastStudied' ? 'Last Studied' : 
                       sortBy === 'createdAt' ? 'Created Date' : 
                       sortBy === 'title' ? 'Title' : 
                       sortBy === 'cards' ? 'Card Count' : 
                       'Progress'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#15052a] rounded-lg border border-gray-800/30 shadow-xl z-10 py-1">
                      <button 
                        className={`w-full text-left px-4 py-2 hover:bg-[#18092a] flex items-center justify-between ${sortBy === 'lastStudied' ? 'text-[#00ff94]' : 'text-white/80'}`}
                        onClick={() => handleSortChange('lastStudied')}
                      >
                        <span>Last Studied</span>
                        {getSortIcon('lastStudied')}
                      </button>
                      <button 
                        className={`w-full text-left px-4 py-2 hover:bg-[#18092a] flex items-center justify-between ${sortBy === 'createdAt' ? 'text-[#00ff94]' : 'text-white/80'}`}
                        onClick={() => handleSortChange('createdAt')}
                      >
                        <span>Created Date</span>
                        {getSortIcon('createdAt')}
                      </button>
                      <button 
                        className={`w-full text-left px-4 py-2 hover:bg-[#18092a] flex items-center justify-between ${sortBy === 'title' ? 'text-[#00ff94]' : 'text-white/80'}`}
                        onClick={() => handleSortChange('title')}
                      >
                        <span>Title</span>
                        {getSortIcon('title')}
                      </button>
                      <button 
                        className={`w-full text-left px-4 py-2 hover:bg-[#18092a] flex items-center justify-between ${sortBy === 'cards' ? 'text-[#00ff94]' : 'text-white/80'}`}
                        onClick={() => handleSortChange('cards')}
                      >
                        <span>Card Count</span>
                        {getSortIcon('cards')}
                      </button>
                      <button 
                        className={`w-full text-left px-4 py-2 hover:bg-[#18092a] flex items-center justify-between ${sortBy === 'progress' ? 'text-[#00ff94]' : 'text-white/80'}`}
                        onClick={() => handleSortChange('progress')}
                      >
                        <span>Progress</span>
                        {getSortIcon('progress')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ff94]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                <p className="text-white">{error}</p>
                <button 
                  className="mt-4 bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
                  onClick={() => debouncedFetchFlashcardSets()}
                >
                  Retry
                </button>
              </div>
            ) : flashcardSets.length === 0 ? (
              <div className="bg-[#18092a]/60 rounded-xl p-8 border border-gray-800/30 shadow-lg text-center">
                <h3 className="text-xl font-bold mb-4">No Flashcard Sets Yet</h3>
                <p className="text-white/70 mb-6">Create your first flashcard set to start learning!</p>
                <button 
                  className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center gap-1"
                  onClick={handleOpenCreateModal}
                >
                  <AddCircleOutlineIcon fontSize="small" />
                  <span>Create Your First Set</span>
                </button>
              </div>
            ) : filteredSets.length === 0 ? (
              <div className="bg-[#18092a]/60 rounded-xl p-8 border border-gray-800/30 shadow-lg text-center">
                <h3 className="text-xl font-bold mb-4">No Matching Flashcard Sets</h3>
                <p className="text-white/70 mb-6">No flashcard sets match your search criteria.</p>
                <button 
                  className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredSets.map(set => (
                  <FlashcardCard 
                    key={set.id}
                    id={set.id}
                    title={set.title}
                    cards={set.cards}
                    lastStudied={set.lastStudiedFormatted}
                    progress={set.progress}
                    onDelete={handleFlashcardDeleted}
                    isFavorite={set.favorite}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Flashcard Creation Modal */}
      <FlashcardCreationModal 
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
    </div>
  )
}

export default Flashcards 