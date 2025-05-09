import { useState, useEffect } from 'react';
import logger from '../utils/logger';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Tab, 
  Tabs, 
  Box, 
  Chip, 
  useMediaQuery,
  Pagination,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';

import { useFlashcardSets, useDeleteFlashcardSet } from '../api/queries/flashcards';
import ShareModal from './ShareModal';
import { useNavigate } from 'react-router-dom';

function FlashcardCard({ flashcard, onDelete, onRefresh }) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Use React Query mutation for deleting flashcard set
  const { mutate: deleteFlashcardSet } = useDeleteFlashcardSet();
  
  const handleStudyClick = () => {
    navigate(`/study/${flashcard.id}`);
  };
  
  const handleEditClick = () => {
    navigate(`/edit/${flashcard.id}`);
  };
  
  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = async () => {
    try {
      // Use the React Query mutation to delete the flashcard set
      deleteFlashcardSet(flashcard.id, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          if (onDelete) onDelete(flashcard.id);
          if (onRefresh) onRefresh();
        },
        onError: (error) => {
          logger.error('Error deleting flashcard set:', error);
          alert('Failed to delete flashcard set. Please try again.');
          setShowDeleteConfirm(false);
        }
      });
    } catch (error) {
      logger.error('Error deleting flashcard set:', error);
      alert('Failed to delete flashcard set. Please try again.');
      setShowDeleteConfirm(false);
    }
  };
  
  return (
    <Grid item xs={12} sm={6} md={4} className="flex">
      <div className="bg-[#18092a]/60 rounded-xl p-4 border border-gray-800/30 shadow-lg text-white w-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold truncate pr-2">{flashcard.title}</h3>
          <div className="flex space-x-1">
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
              <p className="text-white/70 mb-6">Are you sure you want to delete "{flashcard.title}"? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg"
                >
                  Delete
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
            id: flashcard.id,
            type: "flashcards",
            title: flashcard.title
          }}
        />
        
        <div className="mb-3">
          <span className="text-white/70 text-sm">
            {flashcard.cards} {flashcard.cards === 1 ? 'card' : 'cards'}
          </span>
          <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#00ff94]" 
              style={{ width: `${flashcard.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-white/70 text-sm mb-4 flex items-center gap-1">
          <AccessTimeIcon fontSize="small" />
          <span>Last studied: {flashcard.lastStudied}</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex-1 text-sm"
            onClick={handleStudyClick}
          >
            Study
          </button>
          <button 
            className="bg-[#18092a]/60 text-white px-3 py-1.5 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors text-sm"
            onClick={handleEditClick}
          >
            Edit
          </button>
        </div>
      </div>
    </Grid>
  );
}

function FlashcardModal({ open, onClose, onUpdate }) {
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [studyStatusFilter, setStudyStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const isMobile = useMediaQuery('(max-width:640px)');
  
  // Use React Query hook to fetch flashcard sets
  const { 
    data: flashcardSets,
    isLoading: isLoadingFlashcards, 
    refetch 
  } = useFlashcardSets();
  
  // Items per page for pagination
  const ITEMS_PER_PAGE = 9;
  
  // Transform data when it's loaded
  useEffect(() => {
    if (flashcardSets) {
      const transformedSets = flashcardSets.map(set => ({
        id: set._id,
        title: set.title,
        cards: set.cardCount || 0,
        lastStudied: formatLastStudied(set.lastStudied),
        progress: set.progress || 0,
        createdAt: set.createdAt,
        isStudied: !!set.lastStudied
      }));
      
      setFlashcards(transformedSets);
      setIsLoading(false);
    }
  }, [flashcardSets]);
  
  // Update loading state
  useEffect(() => {
    setIsLoading(isLoadingFlashcards);
  }, [isLoadingFlashcards]);
  
  // Refetch data when modal is opened
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);
  
  // Format the last studied date
  const formatLastStudied = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
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
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const handleSortOrder = (order) => {
    setSortOrder(order);
    setPage(1);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };
  
  const handleStudyStatusFilter = (status) => {
    setStudyStatusFilter(status);
    setPage(1);
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleDeleteFlashcard = (id) => {
    const updatedFlashcards = flashcards.filter(f => f.id !== id);
    setFlashcards(updatedFlashcards);
    if (onUpdate) onUpdate();
  };
  
  const resetFilters = () => {
    setSearchQuery('');
    setStudyStatusFilter('all');
    setSortOrder('newest');
    setPage(1);
  };
  
  // Filter and sort flashcards
  const getFilteredFlashcards = () => {
    let filtered = [...flashcards];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(flashcard => 
        flashcard.title.toLowerCase().includes(query)
      );
    }
    
    // Filter by study status
    if (studyStatusFilter === 'studied') {
      filtered = filtered.filter(flashcard => flashcard.isStudied);
    } else if (studyStatusFilter === 'not-studied') {
      filtered = filtered.filter(flashcard => !flashcard.isStudied);
    }
    
    // Apply sorting
    if (sortOrder === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'name-asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'name-desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOrder === 'cards-count') {
      filtered.sort((a, b) => b.cards - a.cards);
    } else if (sortOrder === 'progress') {
      filtered.sort((a, b) => b.progress - a.progress);
    }
    
    return filtered;
  };
  
  const filteredFlashcards = getFilteredFlashcards();
  
  // Calculate total pages and paginated flashcards
  const totalPages = Math.ceil(filteredFlashcards.length / ITEMS_PER_PAGE);
  const paginatedFlashcards = filteredFlashcards.slice(
    (page - 1) * ITEMS_PER_PAGE, 
    page * ITEMS_PER_PAGE
  );
  
  // Create custom scrollbar styles
  const scrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      '&:hover': {
        background: 'rgba(0, 255, 148, 0.2)',
      },
    },
  };
  
  // Custom styles for dark theme inputs
  const darkInputStyles = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(0, 255, 148, 0.5)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#00ff94',
      },
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    '& .MuiInputBase-input': {
      color: 'white',
    },
    '& .MuiSvgIcon-root': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        style: {
          backgroundColor: '#18092a',
          color: 'white',
          borderRadius: '0.75rem',
          border: '1px solid rgba(75, 85, 99, 0.3)'
        }
      }}
    >
      <DialogTitle className="flex justify-between items-center">
        <span className="text-xl font-bold">All Flashcard Sets</span>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon className="text-white/70" />
        </IconButton>
      </DialogTitle>
      
      {/* Search bar */}
      <Box className="px-6 py-3 border-b border-gray-800/30">
        <TextField
          placeholder="Search flashcards..."
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
          sx={darkInputStyles}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-white/50" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setSearchQuery('')}
                  size="small"
                  className="text-white/50"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
      
      {/* Filters and sorting */}
      <Box className="border-b border-gray-800/30 px-6 py-2 flex justify-between">
        <div className="flex items-center gap-2">
          <IconButton 
            color="inherit" 
            onClick={toggleFilters}
            className={showFilters ? "text-[#00ff94]" : "text-white/70"}
          >
            <FilterListIcon />
          </IconButton>
          
          <FormControl sx={{ minWidth: 120, ...darkInputStyles }} size="small">
            <InputLabel id="sort-order-label">Sort By</InputLabel>
            <Select
              labelId="sort-order-label"
              value={sortOrder}
              label="Sort By"
              onChange={(e) => handleSortOrder(e.target.value)}
              MenuProps={{
                sx: {
                  '& .MuiPaper-root': {
                    backgroundColor: '#18092a',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  },
                  '& .MuiMenuItem-root': {
                    color: 'white',
                  },
                }
              }}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="name-asc">Name (A-Z)</MenuItem>
              <MenuItem value="name-desc">Name (Z-A)</MenuItem>
              <MenuItem value="cards-count">Most Cards</MenuItem>
              <MenuItem value="progress">Progress</MenuItem>
            </Select>
          </FormControl>
        </div>
        
        {(searchQuery || studyStatusFilter !== 'all' || sortOrder !== 'newest') && (
          <button 
            className="text-white/70 hover:text-white text-sm"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        )}
      </Box>
      
      {/* Filter chips */}
      {showFilters && (
        <Box className="px-6 py-3 border-b border-gray-800/30 flex gap-2 flex-wrap">
          <Chip 
            label="All Sets" 
            variant={studyStatusFilter === 'all' ? 'filled' : 'outlined'}
            onClick={() => handleStudyStatusFilter('all')}
            className={studyStatusFilter === 'all' ? 'bg-[#00ff94]/20 text-[#00ff94] border-[#00ff94]/30' : 'text-white/70 border-white/30'}
          />
          <Chip 
            label="Studied" 
            variant={studyStatusFilter === 'studied' ? 'filled' : 'outlined'}
            onClick={() => handleStudyStatusFilter('studied')}
            className={studyStatusFilter === 'studied' ? 'bg-[#a259ff]/20 text-[#a259ff] border-[#a259ff]/30' : 'text-white/70 border-white/30'}
          />
          <Chip 
            label="Not Studied" 
            variant={studyStatusFilter === 'not-studied' ? 'filled' : 'outlined'}
            onClick={() => handleStudyStatusFilter('not-studied')}
            className={studyStatusFilter === 'not-studied' ? 'bg-[#3ec1ff]/20 text-[#3ec1ff] border-[#3ec1ff]/30' : 'text-white/70 border-white/30'}
          />
        </Box>
      )}
      
      <DialogContent 
        className="bg-[#18092a]"
        sx={scrollbarStyles}
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-12 h-12 border-4 border-[#00ff94]/20 border-t-[#00ff94] rounded-full animate-spin"></div>
          </div>
        ) : filteredFlashcards.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/70">No flashcard sets found</p>
            {(searchQuery || studyStatusFilter !== 'all') && (
              <button 
                className="mt-4 px-4 py-2 bg-[#00ff94]/10 text-[#00ff94] rounded-lg border border-[#00ff94]/30 hover:bg-[#00ff94]/20"
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedFlashcards.map(flashcard => (
                <FlashcardCard 
                  key={flashcard.id} 
                  flashcard={flashcard} 
                  onDelete={handleDeleteFlashcard}
                  onRefresh={refetch}
                />
              ))}
            </Grid>
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  variant="outlined" 
                  shape="rounded"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: 'rgba(0, 255, 148, 0.2)',
                      color: '#00ff94',
                      borderColor: 'rgba(0, 255, 148, 0.5)'
                    }
                  }}
                />
              </div>
            )}
            
            <div className="text-center mt-4 text-white/50 text-xs">
              Showing {filteredFlashcards.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(page * ITEMS_PER_PAGE, filteredFlashcards.length)} of {filteredFlashcards.length} flashcard sets
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default FlashcardModal; 