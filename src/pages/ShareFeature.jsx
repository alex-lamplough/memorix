import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Skeleton,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import { useNavigate } from 'react-router-dom';

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
  const [tabValue, setTabValue] = useState(0);
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
        if (tabValue === 1 && item.type !== 'flashcards') return false;
        if (tabValue === 2 && item.type !== 'quiz') return false;
        
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
  }, [tabValue, searchQuery, loading]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
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
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={40} />
                  <Skeleton variant="text" width="90%" height={20} sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={70} height={24} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={80} height={36} />
                  <Skeleton variant="rectangular" width={80} height={36} sx={{ ml: 1 }} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (filteredContent.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          py: 5 
        }}>
          <Typography variant="h6">No shared content found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or filters
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {filteredContent.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: '#18092a',
              color: 'white',
              borderRadius: '12px'
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {item.type === 'flashcards' 
                    ? <SchoolIcon sx={{ mr: 1, color: '#00ff94' }} /> 
                    : <QuizIcon sx={{ mr: 1, color: '#00ff94' }} />
                  }
                  <Typography variant="body2" color="text.secondary">
                    {item.type === 'flashcards' ? 'Flashcards' : 'Quiz'}
                  </Typography>
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.description}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  By: {item.author} • Shared: {new Date(item.dateShared).toLocaleDateString()}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {item.tags.map(tag => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(0, 255, 148, 0.1)', 
                        color: '#00ff94',
                        '&:hover': { backgroundColor: 'rgba(0, 255, 148, 0.2)' } 
                      }} 
                    />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VisibilityIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {item.views}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {item.favorites}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.type === 'flashcards' 
                      ? `${item.cardCount} cards` 
                      : `${item.questionCount} questions`}
                  </Typography>
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  size="small" 
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleViewItem(item)}
                  sx={{ 
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': { 
                      borderColor: '#00ff94',
                      color: '#00ff94'
                    }
                  }}
                >
                  View
                </Button>
                <Button 
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopyShareLink(item)}
                  sx={{ 
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': { 
                      borderColor: '#00ff94',
                      color: '#00ff94'
                    }
                  }}
                >
                  Share
                </Button>
                <IconButton 
                  size="small"
                  onClick={() => toggleFavorite(item.id)}
                  sx={{ ml: 'auto', color: favoriteItems[item.id] ? '#00ff94' : 'text.secondary' }}
                >
                  {favoriteItems[item.id] ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shared Flashcards & Quizzes
      </Typography>
      
      <Typography variant="body1" paragraph sx={{ mb: 4 }}>
        Discover and learn from flashcards and quizzes shared by the Memorix community
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search by title, description, author or tags..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { 
              backgroundColor: '#18092a',
              color: 'white',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 255, 148, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00ff94',
              },
            }
          }}
        />
      </Box>
      
      <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': { 
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': { color: '#00ff94' }
            },
            '& .MuiTabs-indicator': { backgroundColor: '#00ff94' }
          }}
        >
          <Tab label="All" />
          <Tab label="Flashcards" />
          <Tab label="Quizzes" />
        </Tabs>
      </Box>
      
      {renderContent()}
    </Container>
  );
};

export default ShareFeature; 