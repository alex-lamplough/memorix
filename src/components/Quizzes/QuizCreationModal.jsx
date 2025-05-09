import { useState, useEffect } from 'react'
import logger from '../../utils/logger';
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
  CircularProgress,
  Slider
} from '@mui/material'

// Icons
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import QuizIcon from '@mui/icons-material/Quiz'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

// React Query hooks
import { useCreateQuiz, useGenerateQuestions } from '../../api/queries/quizzes'

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
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([])
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  
  // Use React Query mutations
  const { mutate: createQuiz, isLoading: isCreating } = useCreateQuiz();
  const { 
    mutate: generateQuestionsWithAI, 
    isLoading: isGeneratingQuestions
  } = useGenerateQuestions();
  
  // Calculate combined loading state
  const isLoading = isCreating || isGenerating || isGeneratingQuestions;
  
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
    setAiGeneratedQuestions([])
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
  
  // Update generateQuestionsWithAI to use React Query
  const handleGenerateQuestions = async () => {
    if (!aiPrompt) {
      showSnackbarMessage('Please enter a topic or content for the quiz questions', 'error')
      return
    }
    
    try {
      // Set generating state to true to show loading indicator
      setIsGenerating(true)
      
      // Call the mutation to generate quiz questions
      generateQuestionsWithAI(
        {
          content: aiPrompt,
          count: questionCount,
          difficulty
        }, 
        {
          onSuccess: (data) => {
            // Set the generated questions
            if (data.questions && Array.isArray(data.questions)) {
              setAiGeneratedQuestions(data.questions)
              // If no title is set, use the generated title or a default based on the prompt
              if (!title) {
                setTitle(data.title || `Quiz: ${aiPrompt.slice(0, 30)}${aiPrompt.length > 30 ? '...' : ''}`)
              }
              showSnackbarMessage('Questions generated successfully!', 'success')
            } else {
              throw new Error('Invalid response format from server')
            }
            setIsGenerating(false);
          },
          onError: (error) => {
            logger.error('Error generating quiz questions:', error)
            showSnackbarMessage('Failed to generate questions. Please try again.', 'error')
            setIsGenerating(false);
          }
        }
      );
    } catch (error) {
      logger.error('Error generating quiz questions:', error)
      showSnackbarMessage('Failed to generate questions. Please try again.', 'error')
      setIsGenerating(false);
    }
  }
  
  // Use AI generated questions for the quiz
  const useGeneratedQuestions = () => {
    if (aiGeneratedQuestions.length > 0) {
      setQuestions(aiGeneratedQuestions)
      setActiveTab(0) // Switch to manual tab to edit the questions
      showSnackbarMessage('AI-generated questions added!', 'success')
    }
  }
  
  const showSnackbarMessage = (message, severity) => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setShowSnackbar(true)
  }
  
  // Update saveQuiz to use React Query
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
    
    try {
      // Calculate estimated time based on question count (approx 30 sec per question)
      const estimatedTime = `${Math.max(5, Math.ceil(questions.length * 0.5))} min`
      
      // Create tags based on category if provided
      const tags = category ? [category] : []
      
      // Format difficulty for display (capitalize first letter)
      const formattedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
      
      // Create the quiz object
      const quizData = {
        title,
        description,
        category,
        isPublic,
        difficulty: formattedDifficulty,
        questionCount: questions.length,
        time: estimatedTime,
        tags,
        questions
      };
      
      // Use the mutation
      createQuiz(quizData, {
        onSuccess: (response) => {
          showSnackbarMessage('Quiz saved successfully!', 'success');
          resetForm();
          
          // Call onQuizCreated callback if provided
          if (typeof onQuizCreated === 'function') {
            onQuizCreated(response);
          }
          
          onClose();
        },
        onError: (error) => {
          logger.error('Error saving quiz:', error);
          showSnackbarMessage('Failed to save quiz. Please try again.', 'error');
        }
      });
    } catch (error) {
      logger.error('Error saving quiz:', error);
      showSnackbarMessage('Failed to save quiz. Please try again.', 'error');
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
            color: '#00ff94', 
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <QuizIcon fontSize="inherit" />
            Create New Quiz
          </Box>
          
          {!isLoading && !isGenerating && (
            <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#00ff94',
              },
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: '#00ff94',
                },
              },
            }}
          >
            <Tab label="Manual Creation" sx={{ textTransform: 'none' }} />
            <Tab label="AI Generation" sx={{ textTransform: 'none' }} />
          </Tabs>
        </Box>
        
        <DialogContent dividers sx={{ padding: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ padding: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
              <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                <FormControl fullWidth variant="outlined">
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
          
          <Box role="tabpanel" hidden={activeTab !== 0} sx={{ padding: 3, flexGrow: 1, overflow: 'auto' }}>
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
                    <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                      <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          backgroundColor: 'rgba(46, 0, 51, 0.9)',
                          padding: '0 8px'
                        }}>Type</InputLabel>
                        <Select
                          value={question.type}
                          onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
                          label="Type"
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
          
          <Box role="tabpanel" hidden={activeTab !== 1} sx={{ padding: 3, flexGrow: 1, overflow: 'auto' }}>
            <Typography variant="h6" color="#00ff94" sx={{ mb: 2 }}>
              <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Generate Quiz Questions with AI
            </Typography>
            
            <TextField
              label="Topic or Content"
              placeholder="Enter a topic or paste content to generate quiz questions from"
              multiline
              rows={6}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              fullWidth
              variant="outlined"
              margin="normal"
              InputProps={{
                sx: {
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#00ff94'
                  }
                }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Difficulty</InputLabel>
                  <Select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    label="Difficulty"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#00ff94'
                      }
                    }}
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ width: '100%', padding: '8px 16px' }}>
                  <Typography id="question-count-slider" gutterBottom>
                    Number of Questions: {questionCount}
                  </Typography>
                  <Slider
                    value={questionCount}
                    onChange={(e, newValue) => setQuestionCount(newValue)}
                    aria-labelledby="question-count-slider"
                    min={3}
                    max={15}
                    step={1}
                    valueLabelDisplay="auto"
                    sx={{
                      color: '#00ff94',
                      '& .MuiSlider-thumb': {
                        '&:hover, &.Mui-active': {
                          boxShadow: '0 0 0 8px rgba(0, 255, 148, 0.16)',
                        },
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleGenerateQuestions}
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
                {isGenerating ? 'Generating...' : 'Generate Questions'}
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
                  Generating your quiz questions...
                </Typography>
                <Typography variant="body2" align="center" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                  This might take a moment. Our AI is crafting challenging quiz questions based on your input.
                </Typography>
              </Box>
            )}
            
            {/* Display generated questions if available */}
            {!isGenerating && aiGeneratedQuestions.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="#00ff94">
                    Generated Questions ({aiGeneratedQuestions.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={useGeneratedQuestions}
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{
                      borderColor: '#00ff94',
                      color: '#00ff94',
                      '&:hover': {
                        borderColor: '#00ff94',
                        backgroundColor: 'rgba(0, 255, 148, 0.1)'
                      }
                    }}
                  >
                    Use These Questions
                  </Button>
                </Box>
                
                {/* List of generated questions */}
                <Box sx={{ mt: 2 }}>
                  {aiGeneratedQuestions.map((question, index) => (
                    <Paper key={index} sx={{ 
                      mb: 2, 
                      p: 2, 
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        {index + 1}. {question.question}
                      </Typography>
                      <Box component="ul" sx={{ pl: 4, mb: 0 }}>
                        {question.options.map((option, optIdx) => (
                          <Typography 
                            component="li" 
                            key={optIdx} 
                            sx={{ 
                              color: optIdx === question.correctAnswer ? '#00ff94' : 'white',
                              fontWeight: optIdx === question.correctAnswer ? 'bold' : 'normal'
                            }}
                          >
                            {option} {optIdx === question.correctAnswer && '✓'}
                          </Typography>
                        ))}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ padding: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Button 
            onClick={onClose} 
            disabled={isLoading || isGenerating}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: 'white'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={saveQuiz}
            disabled={isLoading || isGenerating}
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
            {isLoading ? <CircularProgress size={24} sx={{ color: '#18092a' }} /> : 'Save Quiz'}
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
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default QuizCreationModal 