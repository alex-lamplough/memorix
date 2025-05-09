import { useState, useEffect, useRef } from 'react';
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
  InputLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import QuizIcon from '@mui/icons-material/Quiz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TuneIcon from '@mui/icons-material/Tune';

// Import React Query hooks
import { useActivities, useGeneratedActivities } from '../api/queries/activities';
import { useFlashcardSets } from '../api/queries/flashcards';
import { useQuizzes } from '../api/queries/quizzes';

function ActivityItem({ activity }) {
  // Format the timestamp
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Define icon and color based on activity type
  const getActivityDetails = () => {
    switch (activity.actionType) {
      case 'study':
        return {
          icon: <AccessTimeIcon />,
          color: '#00ff94',
          label: `Studied ${activity.cardsStudied || 'some'} cards`,
          bgColor: 'bg-[#00ff94]/10'
        };
      case 'create':
        return {
          icon: <AddCircleOutlineIcon />,
          color: '#a259ff',
          label: `Created new ${activity.itemType}`,
          bgColor: 'bg-[#a259ff]/10'
        };
      case 'complete':
        return {
          icon: <CheckCircleOutlineIcon />,
          color: '#3ec1ff',
          label: `Completed ${activity.itemType}`,
          bgColor: 'bg-[#3ec1ff]/10'
        };
      case 'update':
        return {
          icon: <CollectionsBookmarkIcon />,
          color: '#ffeb3b',
          label: `Updated ${activity.itemType}`,
          bgColor: 'bg-[#ffeb3b]/10'
        };
      default:
        return {
          icon: <CollectionsBookmarkIcon />,
          color: '#00ff94',
          label: 'Activity',
          bgColor: 'bg-[#00ff94]/10'
        };
    }
  };
  
  const { icon, color, label, bgColor } = getActivityDetails();
  
  return (
    <div className="flex items-center gap-3 py-4 border-b border-gray-800/30">
      <div className={`p-2 ${bgColor} rounded-lg`} style={{ color }}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-white">{activity.title}</h4>
        <p className="text-white/70 text-sm">{label} • {formatTimeAgo(activity.timestamp)}</p>
      </div>
      {activity.itemType === 'flashcard' ? (
        <CollectionsBookmarkIcon className="text-white/40" />
      ) : (
        <QuizIcon className="text-white/40" />
      )}
    </div>
  );
}

function ActivityModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityLimit, setActivityLimit] = useState(100);
  const [totalActivities, setTotalActivities] = useState(0);
  const isMobile = useMediaQuery('(max-width:640px)');
  
  // Items per page for pagination
  const ITEMS_PER_PAGE = 8;
  // Available activity limit options
  const LIMIT_OPTIONS = [100, 250, 500, 1000, 'All'];
  
  // First try to fetch from the API directly
  const { 
    data: apiActivities,
    isLoading: isLoadingApiActivities,
    isError: isApiActivitiesError
  } = useActivities({
    limit: activityLimit === 'All' ? undefined : activityLimit,
    sort: sortOrder,
    startDate: startDate ? startDate.toISOString() : undefined,
    endDate: endDate ? endDate.toISOString() : undefined,
    type: activeTab === 1 ? 'flashcard' : activeTab === 2 ? 'quiz' : undefined,
    action: typeFilter !== 'all' ? typeFilter : undefined
  });
  
  // Fallback data sources if the activities API isn't available
  const { data: flashcardSets, isLoading: isLoadingFlashcards } = useFlashcardSets();
  const { data: quizzes, isLoading: isLoadingQuizzes } = useQuizzes();
  
  // Generate activities from data as fallback
  const { 
    data: generatedActivities,
    isLoading: isLoadingGenerated
  } = useGeneratedActivities(
    // Only use these if API activities failed or returned empty
    isApiActivitiesError || (apiActivities && apiActivities.length === 0) ? flashcardSets : null,
    isApiActivitiesError || (apiActivities && apiActivities.length === 0) ? quizzes : null,
    {
      limit: activityLimit,
      filter: activeTab === 1 ? 'flashcard' : activeTab === 2 ? 'quiz' : typeFilter !== 'all' ? typeFilter : undefined
    }
  );
  
  // Determine which activities to use
  const activities = apiActivities && apiActivities.length > 0 ? apiActivities : generatedActivities || [];
  
  // Determine loading state
  const isLoading = isLoadingApiActivities || 
    (isApiActivitiesError && (isLoadingFlashcards || isLoadingQuizzes || isLoadingGenerated));
  
  // Update total activities count whenever activities change
  useEffect(() => {
    if (activities) {
      setTotalActivities(activities.length);
    }
  }, [activities]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1); // Reset page when tab changes
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };
  
  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    setPage(1); // Reset page when filter changes
  };
  
  const handleSortOrder = (order) => {
    setSortOrder(order);
    setPage(1); // Reset page when sort order changes
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset page when search changes
  };
  
  const handleLimitChange = (event) => {
    setActivityLimit(event.target.value);
  };
  
  const handleDateChange = (type, date) => {
    if (type === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    setPage(1); // Reset page when date changes
  };
  
  const resetDateFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  };
  
  const resetAllFilters = () => {
    setTypeFilter('all');
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  };
  
  // Filter activities based on user selections that aren't handled by the API
  const getFilteredActivities = () => {
    let filtered = [...activities];
    
    // Filter by search query (client-side)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.actionType.toLowerCase().includes(query) ||
        a.itemType.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };
  
  const filteredActivities = getFilteredActivities();
  
  // Calculate total pages and paginated activities
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = filteredActivities.slice(
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
  
  // Common MUI form styles for dark theme
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
    // Fix date picker calendar text
    '& .MuiCalendarPicker-root': {
      backgroundColor: '#18092a',
      color: 'white',
    },
    '& .MuiPickersDay-root': {
      color: 'white',
    },
    '& .MuiTypography-root': {
      color: 'white',
    },
  };
  
  // Custom styles for date picker popper
  const datePickerStyles = {
    '& .MuiPaper-root': {
      backgroundColor: '#18092a',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '& .MuiPickersDay-root': {
      color: 'white',
      '&.Mui-selected': {
        backgroundColor: '#00ff94',
        color: '#000',
      },
      '&:hover': {
        backgroundColor: 'rgba(0, 255, 148, 0.2)',
      },
    },
    '& .MuiTypography-root': {
      color: 'white',
    },
    '& .MuiDayCalendar-weekDayLabel': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    '& .MuiPickersCalendarHeader-switchViewButton': {
      color: 'white',
    },
    '& .MuiPickersArrowSwitcher-button': {
      color: 'white',
    },
    '& .MuiPickersDay-dayOutsideMonth': {
      color: 'rgba(255, 255, 255, 0.5)',
    },
  };
  
  // Custom styles for select dropdown
  const selectStyles = {
    ...darkInputStyles,
    '& .MuiPaper-root': {
      backgroundColor: '#18092a',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '& .MuiMenuItem-root': {
      color: 'white',
      '&:hover': {
        backgroundColor: 'rgba(0, 255, 148, 0.1)',
      },
      '&.Mui-selected': {
        backgroundColor: 'rgba(0, 255, 148, 0.2)',
        '&:hover': {
          backgroundColor: 'rgba(0, 255, 148, 0.3)',
        },
      },
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
        <span className="text-xl font-bold">Activity History</span>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon className="text-white/70" />
        </IconButton>
      </DialogTitle>
      
      <Box className="border-b border-gray-800/30">
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          textColor="inherit"
          className="px-6"
          TabIndicatorProps={{
            style: {
              backgroundColor: '#00ff94'
            }
          }}
        >
          <Tab label="All Activities" />
          <Tab label="Flashcards" />
          <Tab label="Quizzes" />
          <Box className="flex-1 flex justify-end">
            <IconButton 
              color="inherit" 
              onClick={toggleAdvancedFilters}
              className={showAdvancedFilters ? "text-[#00ff94]" : "text-white/70"}
              title="Advanced Filters"
            >
              <TuneIcon />
            </IconButton>
            <IconButton 
              color="inherit" 
              onClick={toggleFilters}
              className={showFilters ? "text-[#00ff94]" : "text-white/70"}
              title="Quick Filters"
            >
              <FilterListIcon />
            </IconButton>
            <IconButton 
              color="inherit" 
              onClick={() => handleSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              title={sortOrder === 'newest' ? 'Oldest First' : 'Newest First'}
            >
              <SortIcon className="text-white/70" />
            </IconButton>
          </Box>
        </Tabs>
      </Box>
      
      {/* Search bar */}
      <Box className="px-6 py-3 border-b border-gray-800/30">
        <TextField
          placeholder="Search activities..."
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
          sx={{
            ...darkInputStyles,
            '& .MuiOutlinedInput-root': {
              ...darkInputStyles['& .MuiOutlinedInput-root'],
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
            }
          }}
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
      
      {/* Advanced filters */}
      {showAdvancedFilters && (
        <Box className="px-6 py-3 border-b border-gray-800/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white/90 font-medium">Advanced Filters</h3>
            <Chip 
              label="Reset All" 
              variant="outlined"
              onClick={resetAllFilters}
              className="text-white/70 border-white/30"
              size="small"
            />
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <DatePicker
              label="From Date"
              value={startDate}
              onChange={(date) => handleDateChange('start', date)}
              slotProps={{
                textField: {
                  size: "small",
                  sx: darkInputStyles
                },
                popper: {
                  sx: datePickerStyles
                }
              }}
            />
            <DatePicker
              label="To Date"
              value={endDate}
              onChange={(date) => handleDateChange('end', date)}
              slotProps={{
                textField: {
                  size: "small",
                  sx: darkInputStyles
                },
                popper: {
                  sx: datePickerStyles
                }
              }}
            />
            
            {(startDate || endDate) && (
              <Chip 
                label="Clear Dates" 
                variant="outlined"
                onClick={resetDateFilters}
                className="text-white/70 border-white/30"
                size="small"
              />
            )}
          </div>
          
          <div className="flex gap-3 items-center">
            <FormControl size="small" sx={{ minWidth: 120, ...darkInputStyles }}>
              <InputLabel id="activity-limit-label">Activity Limit</InputLabel>
              <Select
                labelId="activity-limit-label"
                value={activityLimit}
                label="Activity Limit"
                onChange={handleLimitChange}
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
                    '& .MuiList-root': {
                      padding: 0,
                    }
                  }
                }}
              >
                {LIMIT_OPTIONS.map((limit) => (
                  <MenuItem key={limit} value={limit}>
                    {limit === 'All' ? 'All Activities' : `${limit} Activities`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className="text-white/50 text-xs">
              {totalActivities} total activities
            </div>
          </div>
        </Box>
      )}
      
      {/* Quick filters */}
      {showFilters && (
        <Box className="px-6 py-3 border-b border-gray-800/30 flex gap-2 flex-wrap">
          <Chip 
            label="All Types" 
            variant={typeFilter === 'all' ? 'filled' : 'outlined'}
            onClick={() => handleTypeFilter('all')}
            className={typeFilter === 'all' ? 'bg-[#00ff94]/20 text-[#00ff94] border-[#00ff94]/30' : 'text-white/70 border-white/30'}
          />
          <Chip 
            label="Studied" 
            variant={typeFilter === 'study' ? 'filled' : 'outlined'}
            onClick={() => handleTypeFilter('study')}
            className={typeFilter === 'study' ? 'bg-[#00ff94]/20 text-[#00ff94] border-[#00ff94]/30' : 'text-white/70 border-white/30'}
          />
          <Chip 
            label="Created" 
            variant={typeFilter === 'create' ? 'filled' : 'outlined'}
            onClick={() => handleTypeFilter('create')}
            className={typeFilter === 'create' ? 'bg-[#a259ff]/20 text-[#a259ff] border-[#a259ff]/30' : 'text-white/70 border-white/30'}
          />
          <Chip 
            label="Completed" 
            variant={typeFilter === 'complete' ? 'filled' : 'outlined'}
            onClick={() => handleTypeFilter('complete')}
            className={typeFilter === 'complete' ? 'bg-[#3ec1ff]/20 text-[#3ec1ff] border-[#3ec1ff]/30' : 'text-white/70 border-white/30'}
          />
          <Chip 
            label="Updated" 
            variant={typeFilter === 'update' ? 'filled' : 'outlined'}
            onClick={() => handleTypeFilter('update')}
            className={typeFilter === 'update' ? 'bg-[#ffeb3b]/20 text-[#ffeb3b] border-[#ffeb3b]/30' : 'text-white/70 border-white/30'}
          />
          
          <Box className="ml-auto">
            <Chip 
              label={sortOrder === 'newest' ? 'Newest First' : 'Oldest First'} 
              variant="outlined"
              onClick={() => handleSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="text-white/70 border-white/30"
              icon={<SortIcon className="text-white/70" />}
            />
          </Box>
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
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/70">No activity found with the current filters</p>
            {(searchQuery || typeFilter !== 'all' || startDate || endDate) && (
              <button 
                className="mt-4 px-4 py-2 bg-[#00ff94]/10 text-[#00ff94] rounded-lg border border-[#00ff94]/30 hover:bg-[#00ff94]/20"
                onClick={resetAllFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {paginatedActivities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
            
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
              Showing {filteredActivities.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(page * ITEMS_PER_PAGE, filteredActivities.length)} of {filteredActivities.length} activities
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ActivityModal; 