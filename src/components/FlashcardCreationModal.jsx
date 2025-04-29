import { useState, useEffect } from 'react'
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
  Alert
} from '@mui/material'

// Icons
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// Services
import { flashcardService } from '../services/api'

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
  const [isLoading, setIsLoading] = useState(false)
  const [aiGeneratedCards, setAiGeneratedCards] = useState([])
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  
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
    
    setIsLoading(true)
    
    try {
      // Call backend API to generate flashcards using our service
      const data = await flashcardService.generateFlashcards({
        content: aiPrompt,
        count: cardCount,
        difficulty
      })
      
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
    } catch (error) {
      console.error('Error generating flashcards:', error)
      showSnackbarMessage('Failed to generate flashcards. Please try again.', 'error')
    } finally {
      setIsLoading(false)
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
  
  // Save flashcard set
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
    
    setIsLoading(true)
    
    try {
      // Call backend API to save flashcard set
      await flashcardService.createFlashcardSet({
        title,
        description,
        category,
        isPublic,
        cards: cardsToSave
      })
      
      showSnackbarMessage('Flashcard set saved successfully!', 'success')
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error saving flashcard set:', error)
      showSnackbarMessage('Failed to save flashcard set. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
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
            backgroundColor: '#18092a',
            color: 'white',
            borderRadius: '12px',
          }
        }}
      >
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">
            Create Flashcard Set
          </Typography>
          {!isLoading && (
            <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        
        <DialogContent>
          <Box className="mb-6">
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
              InputLabelProps={{
                style: { color: 'rgba(255, 255, 255, 0.7)' },
              }}
              InputProps={{
                sx: { 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              rows={2}
              InputLabelProps={{
                style: { color: 'rgba(255, 255, 255, 0.7)' },
              }}
              InputProps={{
                sx: { 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Category (optional)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              margin="normal"
              InputLabelProps={{
                style: { color: 'rgba(255, 255, 255, 0.7)' },
              }}
              InputProps={{
                sx: { 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }
              }}
            />
          </Box>
          
          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .Mui-selected': { color: '#00ff94' },
                '& .MuiTabs-indicator': { backgroundColor: '#00ff94' },
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
          
          {activeTab === 0 ? (
            // Manual creation tab
            <Box>
              <Typography variant="subtitle1" className="mb-4 font-medium">Create Flashcards</Typography>
              
              <Box className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {cards.map((card, index) => (
                  <Paper 
                    key={index} 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    }}
                  >
                    <Box className="flex justify-between items-center mb-2">
                      <Typography variant="subtitle2">Card {index + 1}</Typography>
                      <IconButton 
                        onClick={() => removeCard(index)}
                        size="small"
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="Front"
                      value={card.front}
                      onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                      margin="dense"
                      required
                      InputLabelProps={{
                        style: { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                      InputProps={{
                        sx: { 
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Back"
                      value={card.back}
                      onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                      margin="dense"
                      required
                      multiline
                      rows={2}
                      InputLabelProps={{
                        style: { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                      InputProps={{
                        sx: { 
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }
                      }}
                    />
                  </Paper>
                ))}
              </Box>
              
              <Button 
                startIcon={<AddIcon />}
                onClick={addCard}
                sx={{ 
                  mt: 2,
                  color: '#00ff94',
                  borderColor: 'rgba(0, 255, 148, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 255, 148, 0.1)',
                    borderColor: '#00ff94',
                  }
                }}
                variant="outlined"
              >
                Add Card
              </Button>
            </Box>
          ) : (
            // AI-assisted tab
            <Box>
              <Typography variant="subtitle1" className="mb-4 font-medium">Generate Flashcards with AI</Typography>
              
              <TextField
                fullWidth
                label="Enter a topic or paste content"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                margin="normal"
                required
                multiline
                rows={4}
                InputLabelProps={{
                  style: { color: 'rgba(255, 255, 255, 0.7)' },
                }}
                InputProps={{
                  sx: { 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }
                }}
              />
              
              <Box className="flex gap-4 mt-4">
                <TextField
                  label="Number of cards"
                  type="number"
                  value={cardCount}
                  onChange={(e) => setCardCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
                  InputProps={{
                    inputProps: { min: 1, max: 20 },
                    sx: { 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }
                  }}
                  InputLabelProps={{
                    style: { color: 'rgba(255, 255, 255, 0.7)' },
                  }}
                />
                
                <TextField
                  select
                  label="Difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  SelectProps={{
                    native: true,
                    sx: { color: 'white' }
                  }}
                  InputProps={{
                    sx: { 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }
                  }}
                  InputLabelProps={{
                    style: { color: 'rgba(255, 255, 255, 0.7)' },
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </TextField>
              </Box>
              
              <Button
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={generateCardsWithAI}
                disabled={isLoading || !aiPrompt}
                sx={{ 
                  mt: 3,
                  mb: 3,
                  backgroundColor: '#00ff94', 
                  color: 'black',
                  '&:hover': {
                    backgroundColor: '#00cc78',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(0, 255, 148, 0.3)',
                    color: 'rgba(0, 0, 0, 0.7)'
                  }
                }}
              >
                {isLoading ? 'Generating...' : 'Generate Flashcards'}
              </Button>
              
              {aiGeneratedCards.length > 0 && (
                <>
                  <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />
                  
                  <Box className="flex justify-between items-center mb-3">
                    <Typography variant="subtitle1" className="font-medium">
                      Generated Flashcards ({aiGeneratedCards.length})
                    </Typography>
                    
                    <Tooltip title="Use these cards (will switch to manual tab)">
                      <Button
                        variant="outlined"
                        startIcon={<CheckCircleIcon />}
                        onClick={useGeneratedCards}
                        sx={{ 
                          color: '#00ff94',
                          borderColor: 'rgba(0, 255, 148, 0.5)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 255, 148, 0.1)',
                            borderColor: '#00ff94',
                          }
                        }}
                      >
                        Use These Cards
                      </Button>
                    </Tooltip>
                  </Box>
                  
                  <Box className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {aiGeneratedCards.map((card, index) => (
                      <Paper 
                        key={index} 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                        }}
                      >
                        <Typography variant="subtitle2" className="mb-1">
                          Card {index + 1}
                        </Typography>
                        <Typography variant="body2" className="font-medium">
                          Front: {card.front || card.question}
                        </Typography>
                        <Typography variant="body2" className="text-white/70 mt-2">
                          Back: {card.back || card.answer}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ padding: '16px 24px', justifyContent: 'space-between' }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            disabled={isLoading}
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={saveFlashcardSet}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ 
              backgroundColor: '#00ff94', 
              color: 'black',
              '&:hover': {
                backgroundColor: '#00cc78',
              }
            }}
          >
            {isLoading ? 'Saving...' : 'Save Flashcard Set'}
          </Button>
        </DialogActions>
      </Dialog>
      
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
            width: '100%', 
            backgroundColor: snackbarSeverity === 'success' ? '#00ff94' : undefined,
            color: snackbarSeverity === 'success' ? 'black' : undefined
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default FlashcardCreationModal 