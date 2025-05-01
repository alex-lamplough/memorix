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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Divider,
  Paper,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material'

// Icons
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import QuizIcon from '@mui/icons-material/Quiz'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

// Services
import { quizService } from '../../services/quiz-service'

/**
 * Modal for creating quizzes with multiple choice and true/false options
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {function} onQuizCreated - Callback function to execute after a quiz is created successfully
 */
const QuizCreationModal = ({ open, onClose, onQuizCreated }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [difficulty, setDifficulty] = useState('medium')
  const [questions, setQuestions] = useState([{ 
    type: 'multiple', 
    question: '', 
    options: ['', '', '', ''], 
    correctAnswer: 0 
  }])
  const [aiPrompt, setAiPrompt] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
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
    setDifficulty('medium')
    setQuestions([{ 
      type: 'multiple', 
      question: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0 
    }])
    setAiPrompt('')
    setQuestionCount(5)
  }
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }
  
  // Handle manual question changes
  const handleQuestionTextChange = (index, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index].question = value
    setQuestions(updatedQuestions)
  }
  
  const handleQuestionTypeChange = (index, value) => {
    const updatedQuestions = [...questions]
    // If changing from multiple choice to true/false, adjust options
    if (value === 'boolean') {
      updatedQuestions[index] = {
        type: value,
        question: updatedQuestions[index].question,
        options: ['True', 'False'],
        correctAnswer: 0 // Default to "True"
      }
    } else {
      // If changing from true/false to multiple choice, expand options
      updatedQuestions[index] = {
        type: value,
        question: updatedQuestions[index].question,
        options: updatedQuestions[index].options.length < 4 
          ? ['', '', '', ''] 
          : updatedQuestions[index].options,
        correctAnswer: 0
      }
    }
    setQuestions(updatedQuestions)
  }
  
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options[optionIndex] = value
    setQuestions(updatedQuestions)
  }
  
  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].correctAnswer = optionIndex
    setQuestions(updatedQuestions)
  }
  
  const addQuestion = () => {
    setQuestions([...questions, { 
      type: 'multiple', 
      question: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0 
    }])
  }
  
  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index)
    setQuestions(updatedQuestions.length ? updatedQuestions : [{ 
      type: 'multiple', 
      question: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0 
    }])
  }
  
  const showSnackbarMessage = (message, severity) => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setShowSnackbar(true)
  }
  
  const saveQuiz = async () => {
    if (!title) {
      showSnackbarMessage('Please enter a title for your quiz', 'error')
      return
    }
    
    if (!questions.length || questions.some(q => !q.question)) {
      showSnackbarMessage('Please ensure all questions have content', 'error')
      return
    }
    
    if (questions.some(q => 
      q.type === 'multiple' && 
      (q.options.some(opt => !opt) || q.options.length < 2)
    )) {
      showSnackbarMessage('Please ensure all multiple choice questions have at least two options', 'error')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Calculate estimated time based on question count (approx 30 sec per question)
      const estimatedTime = `${Math.max(5, Math.ceil(questions.length * 0.5))} min`
      
      // Create tags based on category if provided
      const tags = category ? [category] : []
      
      // Format difficulty for display (capitalize first letter)
      const formattedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
      
      const response = await quizService.createQuiz({
        title,
        description,
        category,
        isPublic,
        difficulty: formattedDifficulty,
        questionCount: questions.length,
        time: estimatedTime,
        tags,
        questions
      })
      
      showSnackbarMessage('Quiz saved successfully!', 'success')
      resetForm()
      
      // Call onQuizCreated callback if provided
      if (typeof onQuizCreated === 'function') {
        onQuizCreated(response?.data)
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving quiz:', error)
      showSnackbarMessage('Failed to save quiz. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <>
      <Dialog 
        open={open} 
        onClose={isLoading ? null : onClose}
        fullWidth
        maxWidth="md"
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
          // Global text styles for the dialog
          '& .MuiFormLabel-root': {
            color: 'rgba(255, 255, 255, 0.9)',
          },
          '& .MuiSvgIcon-root': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          '& .MuiTypography-root': {
            color: 'white',
          },
          '& .MuiFormControlLabel-label': {
            color: 'white',
          },
          '& .MuiList-root': {
            color: 'white',
          }
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
            <QuizIcon sx={{ color: '#00ff94', mr: 1 }} />
            Create Quiz
          </Box>
          
          {!isLoading && (
            <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        
        <DialogContent sx={{ padding: '20px 24px', height: 'auto', overflow: 'visible' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Common header info fields for both tabs */}
            <Box sx={{ mb: 3 }}>
              <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                <Box gridColumn="span 12">
                  <TextField
                    label="Quiz Title"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    variant="outlined"
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
                        backgroundColor: 'rgba(40, 20, 60, 0.9)',
                        padding: '0 8px',
                        zIndex: 20,
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translate(14px, -8px) scale(0.75)',
                        backgroundColor: 'rgba(40, 20, 60, 0.9)',
                        padding: '0 8px',
                      },
                    }}
                  />
                </Box>
                <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                  <TextField
                    label="Category"
                    fullWidth
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    variant="outlined"
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
                        backgroundColor: 'rgba(40, 20, 60, 0.9)',
                        padding: '0 8px',
                        zIndex: 20,
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translate(14px, -8px) scale(0.75)',
                        backgroundColor: 'rgba(40, 20, 60, 0.9)',
                        padding: '0 8px',
                      },
                    }}
                  />
                </Box>
                <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      backgroundColor: 'rgba(40, 20, 60, 0.9)',
                      padding: '0 8px'
                    }}>Difficulty</InputLabel>
                    <Select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      label="Difficulty"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: 'rgba(40, 20, 60, 0.95)',
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
                      <MenuItem value="easy" sx={{ color: 'white' }}>Easy</MenuItem>
                      <MenuItem value="medium" sx={{ color: 'white' }}>Medium</MenuItem>
                      <MenuItem value="hard" sx={{ color: 'white' }}>Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box gridColumn="span 12">
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    variant="outlined"
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
                        backgroundColor: 'rgba(40, 20, 60, 0.9)',
                        padding: '0 8px',
                        zIndex: 20,
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translate(14px, -8px) scale(0.75)',
                        backgroundColor: 'rgba(40, 20, 60, 0.9)',
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
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 148, 0.1)',
                            },
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#00ff94',
                          },
                        }}
                      />
                    }
                    label="Make this quiz public"
                  />
                </Box>
              </Box>
            </Box>
            
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: 'rgba(255, 255, 255, 0.12)',
                mb: 3,
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': {
                    color: '#00ff94',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#00ff94',
                },
              }}
            >
              <Tab label="Manual Creation" />
              <Tab label="AI Assisted" />
            </Tabs>
            
            <Box sx={{ flexGrow: 1, overflow: 'visible', paddingBottom: '16px' }}>
              {activeTab === 0 ? (
                // Manual creation tab
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" className="font-medium">
                      {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addQuestion}
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
                      Add Question
                    </Button>
                  </Box>
                  
                  <Box sx={{ 
                    overflowY: 'visible', 
                    flexGrow: 1,
                    pr: 1,
                  }}>
                    {questions.map((question, qIndex) => (
                      <Paper 
                        key={qIndex}
                        elevation={2}
                        sx={{ 
                          p: 3, 
                          backgroundColor: 'rgba(40, 20, 60, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          mb: 3,
                          '&:hover': {
                            borderColor: 'rgba(0, 255, 148, 0.3)',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            Question {qIndex + 1}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => removeQuestion(qIndex)}
                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                          <Box gridColumn={{ xs: 'span 12', sm: 'span 9' }}>
                            <TextField
                              fullWidth
                              label="Question"
                              value={question.question}
                              onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
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
                                  backgroundColor: 'rgba(40, 20, 60, 0.9)',
                                  padding: '0 8px',
                                  zIndex: 20,
                                },
                                '& .MuiInputLabel-shrink': {
                                  transform: 'translate(14px, -8px) scale(0.75)',
                                  backgroundColor: 'rgba(40, 20, 60, 0.9)',
                                  padding: '0 8px',
                                },
                              }}
                            />
                          </Box>
                          <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                            <FormControl fullWidth variant="outlined" size="small">
                              <InputLabel sx={{ 
                                color: 'rgba(255, 255, 255, 0.9)',
                                backgroundColor: 'rgba(40, 20, 60, 0.9)',
                                padding: '0 8px'
                              }}>Type</InputLabel>
                              <Select
                                value={question.type}
                                onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
                                label="Type"
                                MenuProps={{
                                  PaperProps: {
                                    sx: {
                                      backgroundColor: 'rgba(40, 20, 60, 0.95)',
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
                                <MenuItem value="multiple" sx={{ color: 'white' }}>Multiple Choice</MenuItem>
                                <MenuItem value="boolean" sx={{ color: 'white' }}>True / False</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
                        
                        <FormControl component="fieldset" sx={{ width: '100%' }}>
                          <FormLabel 
                            component="legend" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)', 
                              mb: 1,
                              '&.Mui-focused': {
                                color: 'rgba(255, 255, 255, 0.9)',
                              }
                            }}
                          >
                            Options (select the correct answer)
                          </FormLabel>
                          <RadioGroup 
                            value={question.correctAnswer.toString()}
                            onChange={(e) => handleCorrectAnswerChange(qIndex, parseInt(e.target.value))}
                            sx={{
                              color: 'white'
                            }}
                          >
                            {question.options.map((option, oIndex) => (
                              <Box 
                                key={oIndex} 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  mb: 1
                                }}
                              >
                                <Radio 
                                  value={oIndex.toString()} 
                                  sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    '&.Mui-checked': {
                                      color: '#00ff94',
                                    },
                                  }}
                                />
                                <TextField
                                  fullWidth
                                  placeholder={question.type === 'boolean' ? (oIndex === 0 ? 'True' : 'False') : `Option ${oIndex + 1}`}
                                  value={option}
                                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                  variant="outlined"
                                  size="small"
                                  disabled={question.type === 'boolean'}
                                  InputProps={{
                                    style: { color: 'white' }
                                  }}
                                  sx={{
                                    '& .MuiInputBase-root': {
                                      color: 'white',
                                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                      '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: '#00ff94',
                                      },
                                    }
                                  }}
                                />
                              </Box>
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              ) : (
                // AI-assisted tab - simplified version
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Let AI help you create a quiz based on your topic or content.
                  </Typography>
                  
                  <TextField
                    label="Enter the topic or content for your quiz"
                    fullWidth
                    multiline
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    variant="outlined"
                    placeholder="Example: Generate a quiz about the solar system with questions about planets, moons, and space exploration."
                    sx={{
                      mb: 3,
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
                        backgroundColor: 'rgba(40, 20, 60, 0.9)',
                        padding: '0 8px',
                        zIndex: 20,
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translate(14px, -8px) scale(0.75)',
                      },
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <InputLabel sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        backgroundColor: 'rgba(40, 20, 60, 0.9)',
                        padding: '0 8px'
                      }}>Question Count</InputLabel>
                      <Select
                        value={questionCount}
                        onChange={(e) => setQuestionCount(e.target.value)}
                        label="Question Count"
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: 'rgba(40, 20, 60, 0.95)',
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
                          <MenuItem key={count} value={count} sx={{ color: 'white' }}>{count} Questions</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={true} // Disabled for now since we're not implementing the AI part yet
                      startIcon={<AddCircleOutlineIcon />}
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
                      Generate Quiz
                    </Button>
                    
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', alignSelf: 'center' }}>
                      AI generation coming soon
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Button 
            onClick={onClose}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={saveQuiz}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
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
            {isLoading ? 'Saving...' : 'Save Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ 
            width: '100%',
            bgcolor: snackbarSeverity === 'success' ? 'rgba(0, 255, 148, 0.9)' : undefined,
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

export default QuizCreationModal 