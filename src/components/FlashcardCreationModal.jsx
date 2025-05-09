import { useState, useEffect } from 'react'
import logger from '../utils/logger';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  IconButton,
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Tooltip,
  Paper,
  Snackbar,
  Alert,
  Grid,
  Slider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material'

// Icons
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

// Import React Query hooks
import { useCreateFlashcardSet, useGenerateFlashcards } from '../api/queries/flashcards'

/**
 * Modal for creating flashcard sets with manual and AI-assisted options
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 */
const FlashcardCreationModal = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [cards, setCards] = useState([{ front: '', back: '' }])
  const [aiPrompt, setAiPrompt] = useState('')
  const [cardCount, setCardCount] = useState(5)
  const [difficulty, setDifficulty] = useState('intermediate')
  const [aiGeneratedCards, setAiGeneratedCards] = useState([])
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  
  // Use React Query mutations
  const createMutation = useCreateFlashcardSet();
  const isLoading = createMutation.isPending || createMutation.isLoading;
  const generateMutation = useGenerateFlashcards();
  const isGenerating = generateMutation.isPending || generateMutation.isLoading;
  
  // Reset form when modal is opened
  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open])
  
  const resetForm = () => {
    setActiveTab(0)
    setTitle('')
    setDescription('')
    setCategory('')
    setIsPublic(false)
    setCards([{ front: '', back: '' }])
    setAiPrompt('')
    setCardCount(5)
    setDifficulty('intermediate')
    setAiGeneratedCards([])
  }
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }
  
  // Handle manual card changes
  const handleCardChange = (index, field, value) => {
    const updatedCards = [...cards]
    updatedCards[index] = { ...updatedCards[index], [field]: value }
    setCards(updatedCards)
  }
  
  const addCard = () => {
    setCards([...cards, { front: '', back: '' }])
  }
  
  const removeCard = (index) => {
    const updatedCards = cards.filter((_, i) => i !== index)
    setCards(updatedCards.length ? updatedCards : [{ front: '', back: '' }])
  }
  
  // Handle AI card generation
  const generateCardsWithAI = async () => {
    if (!aiPrompt) {
      showSnackbarMessage('Please enter a topic or content for the flashcards', 'error')
      return
    }
    
    try {
      // Call the mutation to generate flashcards
      generateMutation.mutate(
        {
          content: aiPrompt,
          count: cardCount,
          difficulty
        },
        {
          onSuccess: (data) => {
            // Set the generated cards
            if (data.cards && Array.isArray(data.cards)) {
              setAiGeneratedCards(data.cards)
              // If no title is set, use the generated title or a default based on the prompt
              if (!title) {
                setTitle(data.title || `Flashcards: ${aiPrompt.slice(0, 30)}${aiPrompt.length > 30 ? '...' : ''}`)
              }
              showSnackbarMessage('Flashcards generated successfully!', 'success')
            } else {
              throw new Error('Invalid response format from server')
            }
          },
          onError: (error) => {
            logger.error('Error generating flashcards:', error)
            showSnackbarMessage('Failed to generate flashcards. Please try again.', 'error')
          }
        }
      );
    } catch (error) {
      logger.error('Error generating flashcards:', error)
      showSnackbarMessage('Failed to generate flashcards. Please try again.', 'error')
    }
  }
  
  // Add AI generated cards to the manual list
  const useGeneratedCards = () => {
    if (aiGeneratedCards.length > 0) {
      setCards(aiGeneratedCards.map(card => ({ 
        front: card.front || card.question || '', 
        back: card.back || card.answer || '' 
      })))
      setActiveTab(0) // Switch to manual tab to edit the cards
      showSnackbarMessage('AI-generated cards added!', 'success')
    }
  }
  
  const showSnackbarMessage = (message, severity) => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setShowSnackbar(true)
  }
  
  // Save flashcard set using React Query mutation
  const saveFlashcardSet = async () => {
    if (!title) {
      showSnackbarMessage('Please enter a title for your flashcard set', 'error')
      return
    }
    
    const cardsToSave = activeTab === 0 ? cards : aiGeneratedCards.map(card => ({ 
      front: card.front || card.question || '', 
      back: card.back || card.answer || '' 
    }))
    
    if (!cardsToSave.length || cardsToSave.some(card => !card.front || !card.back)) {
      showSnackbarMessage('Please ensure all cards have content for front and back', 'error')
      return
    }
    
    const flashcardSet = {
      title,
      description,
      category,
      isPublic,
      cards: cardsToSave
    };
    
    createMutation.mutate(flashcardSet, {
      onSuccess: () => {
        showSnackbarMessage('Flashcard set saved successfully!', 'success');
        resetForm();
        onClose();
      },
      onError: (error) => {
        logger.error('Error saving flashcard set:', error);
        showSnackbarMessage('Failed to save flashcard set. Please try again.', 'error');
      }
    });
  }
  
  return (
    <>
      <Dialog 
        open={open} 
        onClose={isLoading ? null : onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          style: {
            background: 'linear-gradient(to bottom, #2E0033, #260041, #1b1b2f)',
            color: 'white',
            borderRadius: '12px',
            overflow: 'auto',
            maxHeight: '95vh',
            height: 'auto',
            minHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
          }
        }}
        sx={{
          '& ::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '& ::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '& ::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
          },
          '& ::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Box component="h2" sx={{ 
            margin: 0, 
            fontSize: '1.25rem', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center'
          }}>
            <FlashOnIcon sx={{ color: '#00ff94', mr: 1 }} />
            Create Flashcard Set
          </Box>
          
          {!isLoading && (
            <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        
        <DialogContent sx={{ padding: '20px 24px', height: 'auto', overflow: 'visible' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header info */}
            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={3} sx={{ mb: 4 }}>
              <Box gridColumn={{ xs: 'span 12', md: 'span 6' }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="outlined"
                  size="small"
                  required
                  sx={{
                    mb: 1,
                    mt: 0.5,
                    '& .MuiInputBase-root': {
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      paddingLeft: '12px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        paddingLeft: '10px',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff94',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.9)',
                      backgroundColor: 'rgba(46, 0, 51, 0.9)',
                      padding: '0 8px',
                      zIndex: 20,
                    },
                    '& .MuiInputLabel-shrink': {
                      transform: 'translate(14px, -8px) scale(0.75)',
                      backgroundColor: 'rgba(46, 0, 51, 0.9)',
                      padding: '0 8px',
                    },
                  }}
                />
              </Box>
              <Box gridColumn={{ xs: 'span 12', md: 'span 6' }}>
                <TextField
                  fullWidth
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    mb: 1,
                    mt: 0.5,
                    '& .MuiInputBase-root': {
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      paddingLeft: '12px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        paddingLeft: '10px',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff94',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.9)',
                      backgroundColor: 'rgba(46, 0, 51, 0.9)',
                      padding: '0 8px',
                      zIndex: 20,
                    },
                    '& .MuiInputLabel-shrink': {
                      transform: 'translate(14px, -8px) scale(0.75)',
                      backgroundColor: 'rgba(46, 0, 51, 0.9)',
                      padding: '0 8px',
                    },
                  }}
                />
              </Box>
              <Box gridColumn="span 12">
                <TextField
                  fullWidth
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    mb: 1,
                    mt: 0.5,
                    '& .MuiInputBase-root': {
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      paddingLeft: '12px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        paddingLeft: '10px',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff94',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.9)',
                      backgroundColor: 'rgba(46, 0, 51, 0.9)',
                      padding: '0 8px',
                      zIndex: 20,
                    },
                    '& .MuiInputLabel-shrink': {
                      transform: 'translate(14px, -8px) scale(0.75)',
                      backgroundColor: 'rgba(46, 0, 51, 0.9)',
                      padding: '0 8px',
                    },
                  }}
                />
              </Box>
              <Box gridColumn="span 12">
                <FormControlLabel
                  control={
                    <Switch 
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#00ff94',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#00ff94',
                        },
                      }}
                    />
                  }
                  label="Make deck public"
                  sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                />
              </Box>
            </Box>
            
            {/* Tabs */}
            <Box sx={{ mb: 2 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': { 
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'none',
                    fontWeight: 500,
                  },
                  '& .Mui-selected': { color: '#00ff94' },
                  '& .MuiTabs-indicator': { backgroundColor: '#00ff94' },
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Tab 
                  label="Manual Creation" 
                  icon={<EditIcon />} 
                  iconPosition="start" 
                  disabled={isLoading}
                />
                <Tab 
                  label="AI-Assisted" 
                  icon={<AutoAwesomeIcon />} 
                  iconPosition="start"
                  disabled={isLoading}
                />
              </Tabs>
            </Box>
            
            {/* Tab content - fixed height removed to enable scrolling */}
            <Box sx={{ 
              flexGrow: 1, 
              overflow: 'visible', 
              paddingBottom: '16px'
            }}>
              {activeTab === 0 ? (
                // Manual creation tab
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" className="font-medium">
                      {cards.length} {cards.length === 1 ? 'Card' : 'Cards'}
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addCard}
                      variant="outlined"
                      size="small"
                      sx={{ 
                        color: '#00ff94', 
                        borderColor: '#00ff94',
                        '&:hover': {
                          borderColor: '#00ff94',
                          backgroundColor: 'rgba(0, 255, 148, 0.1)',
                        }
                      }}
                    >
                      Add Card
                    </Button>
                  </Box>
                  
                  <Box sx={{ 
                    overflowY: 'visible', 
                    flexGrow: 1,
                    pr: 1,
                  }}>
                    <Grid container spacing={2}>
                      {cards.map((card, index) => (
                        <Grid item xs={12} key={index}>
                          <Paper 
                            key={index}
                            elevation={2}
                            sx={{ 
                              p: 3, 
                              backgroundColor: 'rgba(40, 20, 60, 0.5)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              mb: 3,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: 'rgba(0, 255, 148, 0.3)',
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                Card {index + 1}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => removeCard(index)}
                                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                              <Box gridColumn="span 12">
                                <TextField
                                  fullWidth
                                  label="Question"
                                  value={card.front}
                                  onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                                  variant="outlined"
                                  size="small"
                                  required
                                  sx={{
                                    mb: 2,
                                    '& .MuiInputBase-root': {
                                      color: 'white',
                                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                      paddingLeft: '12px',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                      '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                        paddingLeft: '10px',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: '#00ff94',
                                      },
                                    },
                                    '& .MuiInputLabel-root': {
                                      color: 'rgba(255, 255, 255, 0.9)',
                                      backgroundColor: 'rgba(46, 0, 51, 0.9)',
                                      padding: '0 8px',
                                      zIndex: 20,
                                    },
                                    '& .MuiInputLabel-shrink': {
                                      transform: 'translate(14px, -8px) scale(0.75)',
                                      backgroundColor: 'rgba(46, 0, 51, 0.9)',
                                      padding: '0 8px',
                                    },
                                  }}
                                />
                              </Box>
                              <Box gridColumn="span 12">
                                <TextField
                                  fullWidth
                                  label="Answer"
                                  value={card.back}
                                  onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                                  variant="outlined"
                                  size="small"
                                  required
                                  multiline
                                  rows={2}
                                  sx={{
                                    '& .MuiInputBase-root': {
                                      color: 'white',
                                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                      paddingLeft: '12px',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                      '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                        paddingLeft: '10px',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: '#00ff94',
                                      },
                                    },
                                    '& .MuiInputLabel-root': {
                                      color: 'rgba(255, 255, 255, 0.9)',
                                      backgroundColor: 'rgba(46, 0, 51, 0.9)',
                                      padding: '0 8px',
                                      zIndex: 20,
                                    },
                                    '& .MuiInputLabel-shrink': {
                                      transform: 'translate(14px, -8px) scale(0.75)',
                                      backgroundColor: 'rgba(46, 0, 51, 0.9)',
                                      padding: '0 8px',
                                    },
                                  }}
                                />
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              ) : (
                // AI-assisted tab
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="What would you like to create flashcards about?"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      variant="outlined"
                      size="small"
                      multiline
                      rows={3}
                      placeholder="E.g., The cell structure and function of organelles"
                      sx={{
                        mb: 1,
                        mt: 0.5,
                        '& .MuiInputBase-root': {
                          color: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          paddingLeft: '12px',
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            paddingLeft: '10px',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#00ff94',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.9)',
                          backgroundColor: 'rgba(46, 0, 51, 0.9)',
                          padding: '0 8px',
                          zIndex: 20,
                        },
                        '& .MuiInputLabel-shrink': {
                          transform: 'translate(14px, -8px) scale(0.75)',
                        },
                      }}
                    />
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                        Number of Cards: {cardCount}
                      </Typography>
                      <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                        <InputLabel sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          backgroundColor: 'rgba(46, 0, 51, 0.9)',
                          padding: '0 8px'
                        }}>Card Count</InputLabel>
                        <Select
                          value={cardCount}
                          onChange={(e) => setCardCount(e.target.value)}
                          label="Card Count"
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                backgroundColor: 'rgba(46, 0, 51, 0.95)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                                '& .MuiMenuItem-root': {
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 255, 148, 0.1)',
                                  },
                                  '&.Mui-selected': {
                                    backgroundColor: 'rgba(0, 255, 148, 0.2)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 255, 148, 0.3)',
                                    }
                                  }
                                }
                              }
                            }
                          }}
                          sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#00ff94',
                            },
                            '& .MuiSvgIcon-root': { // Style the dropdown icon
                              color: 'rgba(255, 255, 255, 0.7)'
                            }
                          }}
                        >
                          {[5, 10, 15, 20].map((count) => (
                            <MenuItem key={count} value={count} sx={{ color: 'white' }}>{count} Cards</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                        <InputLabel sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          backgroundColor: 'rgba(46, 0, 51, 0.9)',
                          padding: '0 8px'
                        }}>Difficulty</InputLabel>
                        <Select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          label="Difficulty"
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                backgroundColor: 'rgba(46, 0, 51, 0.95)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                                '& .MuiMenuItem-root': {
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 255, 148, 0.1)',
                                  },
                                  '&.Mui-selected': {
                                    backgroundColor: 'rgba(0, 255, 148, 0.2)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 255, 148, 0.3)',
                                    }
                                  }
                                }
                              }
                            }
                          }}
                          sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#00ff94',
                            },
                            '& .MuiSvgIcon-root': { // Style the dropdown icon
                              color: 'rgba(255, 255, 255, 0.7)'
                            }
                          }}
                        >
                          <MenuItem value="beginner" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#4caf50' }} />
                            Beginner
                          </MenuItem>
                          <MenuItem value="intermediate" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2196f3' }} />
                            Intermediate
                          </MenuItem>
                          <MenuItem value="advanced" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff9800' }} />
                            Advanced
                          </MenuItem>
                          <MenuItem value="expert" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f44336' }} />
                            Expert
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
                    <Button
                      variant="contained"
                      onClick={generateCardsWithAI}
                      startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                      disabled={!aiPrompt || isGenerating}
                      sx={{
                        background: 'linear-gradient(45deg, rgba(0, 255, 148, 0.2), rgba(0, 255, 148, 0.1))',
                        color: '#00ff94',
                        borderRadius: '28px',
                        padding: '12px 24px',
                        fontSize: '1rem',
                        textTransform: 'none',
                        border: '1px solid rgba(0, 255, 148, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, rgba(0, 255, 148, 0.3), rgba(0, 255, 148, 0.2))',
                          boxShadow: '0 0 15px rgba(0, 255, 148, 0.5)'
                        },
                        '&:disabled': {
                          color: 'rgba(255, 255, 255, 0.3)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                    </Button>
                  </Box>
                  
                  {isGenerating && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mt: 4, 
                      mb: 4, 
                      animation: 'pulse 2s infinite'
                    }}>
                      <CircularProgress size={50} sx={{ color: '#00ff94', mb: 2 }} />
                      <Typography variant="h6" align="center">
                        Generating your flashcards...
                      </Typography>
                      <Typography variant="body2" align="center" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                        This might take a moment. Our AI is crafting high-quality flashcards based on your input.
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Generated cards section */}
                  {aiGeneratedCards.length > 0 && (
                    <Box sx={{ 
                      overflowY: 'visible', 
                      flexGrow: 1,
                      mt: 1,
                      pr: 1,
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: '#00ff94', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon fontSize="small" />
                          Generated {aiGeneratedCards.length} Cards
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={useGeneratedCards}
                          sx={{ 
                            color: '#00ff94', 
                            borderColor: '#00ff94',
                            '&:hover': {
                              borderColor: '#00ff94',
                              backgroundColor: 'rgba(0, 255, 148, 0.1)',
                            }
                          }}
                        >
                          Edit These Cards
                        </Button>
                      </Box>
                      
                      <Grid container spacing={2}>
                        {aiGeneratedCards.map((card, index) => (
                          <Grid item xs={12} key={index}>
                            <Paper 
                              elevation={2}
                              sx={{ 
                                p: 3, 
                                backgroundColor: 'rgba(40, 20, 60, 0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                mb: 3,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: 'rgba(0, 255, 148, 0.3)',
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                  Card {index + 1}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => removeCard(index)}
                                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              
                              <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                                <Box gridColumn="span 12">
                                  <TextField
                                    fullWidth
                                    label="Question"
                                    value={card.front}
                                    onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    required
                                    sx={{
                                      mb: 2,
                                      '& .MuiInputBase-root': {
                                        color: 'white',
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        paddingLeft: '12px',
                                      },
                                      '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                          borderColor: 'rgba(255, 255, 255, 0.2)',
                                          paddingLeft: '10px',
                                        },
                                        '&:hover fieldset': {
                                          borderColor: 'rgba(255, 255, 255, 0.3)',
                                        },
                                        '&.Mui-focused fieldset': {
                                          borderColor: '#00ff94',
                                        },
                                      },
                                      '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        backgroundColor: 'rgba(46, 0, 51, 0.9)',
                                        padding: '0 8px',
                                        zIndex: 20,
                                      },
                                      '& .MuiInputLabel-shrink': {
                                        transform: 'translate(14px, -8px) scale(0.75)',
                                        backgroundColor: 'rgba(46, 0, 51, 0.9)',
                                        padding: '0 8px',
                                      },
                                    }}
                                  />
                                </Box>
                                <Box gridColumn="span 12">
                                  <TextField
                                    fullWidth
                                    label="Answer"
                                    value={card.back}
                                    onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    required
                                    multiline
                                    rows={2}
                                    sx={{
                                      '& .MuiInputBase-root': {
                                        color: 'white',
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        paddingLeft: '12px',
                                      },
                                      '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                          borderColor: 'rgba(255, 255, 255, 0.2)',
                                          paddingLeft: '10px',
                                        },
                                        '&:hover fieldset': {
                                          borderColor: 'rgba(255, 255, 255, 0.3)',
                                        },
                                        '&.Mui-focused fieldset': {
                                          borderColor: '#00ff94',
                                        },
                                      },
                                      '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        backgroundColor: 'rgba(46, 0, 51, 0.9)',
                                        padding: '0 8px',
                                        zIndex: 20,
                                      },
                                      '& .MuiInputLabel-shrink': {
                                        transform: 'translate(14px, -8px) scale(0.75)',
                                        backgroundColor: 'rgba(46, 0, 51, 0.9)',
                                        padding: '0 8px',
                                      },
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
          padding: '12px 24px',
          justifyContent: 'space-between' 
        }}>
          <Button 
            onClick={onClose}
            disabled={isLoading}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              } 
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={saveFlashcardSet}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{
              bgcolor: '#00ff94',
              color: '#18092a',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#00cc75',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(0, 255, 148, 0.3)',
                color: 'rgba(24, 9, 42, 0.7)',
              }
            }}
          >
            {isLoading ? 'Saving...' : 'Save Flashcard Set'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={showSnackbar} 
        autoHideDuration={4000} 
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ 
            backgroundColor: snackbarSeverity === 'success' ? '#00ff94' : undefined,
            color: snackbarSeverity === 'success' ? '#18092a' : undefined,
            fontWeight: snackbarSeverity === 'success' ? 'bold' : undefined
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default FlashcardCreationModal 