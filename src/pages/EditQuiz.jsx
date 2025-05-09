import { useState, useEffect, useRef } from 'react'
import logger from '../utils/logger';
import { useParams, useNavigate } from 'react-router-dom'
import { handleRequestError } from '../api/utils'

// React Query
import { useQuiz, useUpdateQuiz } from '../api/queries/quizzes'

// MUI components
import { 
  Snackbar, 
  Alert, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  Select, 
  MenuItem
} from '@mui/material'

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

function EditQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [error, setError] = useState(null)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const isMountedRef = useRef(true)
  
  // Use React Query hooks
  const { 
    data: quizData, 
    isLoading, 
    isError, 
    error: quizError 
  } = useQuiz(id);
  
  const { 
    mutate: updateQuiz, 
    isLoading: isSaving
  } = useUpdateQuiz();
  
  // Set up isMountedRef for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update local state when quiz data changes
  useEffect(() => {
    if (quizData && isMountedRef.current) {
      setQuiz(quizData);
      setError(null);
    }
  }, [quizData]);
  
  // Handle errors from React Query
  useEffect(() => {
    if (isError && isMountedRef.current) {
      setError(quizError?.message || 'Failed to load quiz');
    }
  }, [isError, quizError]);
  
  const showSnackbarMessage = (message, severity) => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setShowSnackbar(true)
  }
  
  const handleTitleChange = (e) => {
    setQuiz(prev => ({
      ...prev,
      title: e.target.value
    }))
  }
  
  const handleDescriptionChange = (e) => {
    setQuiz(prev => ({
      ...prev,
      description: e.target.value
    }))
  }
  
  const handleDifficultyChange = (e) => {
    setQuiz(prev => ({
      ...prev,
      difficulty: e.target.value
    }))
  }
  
  const handleQuestionTextChange = (index, value) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions]
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        question: value
      }
      return {
        ...prev,
        questions: updatedQuestions
      }
    })
  }
  
  const handleQuestionTypeChange = (index, value) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions]
      // If changing from multiple choice to true/false, adjust options
      if (value === 'boolean') {
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          type: value,
          options: ['True', 'False'],
          correctAnswer: 0 // Default to "True"
        }
      } else {
        // If changing from true/false to multiple choice, expand options
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          type: value,
          options: updatedQuestions[index].options?.length < 4 
            ? ['', '', '', ''] 
            : updatedQuestions[index].options,
          correctAnswer: 0
        }
      }
      return {
        ...prev,
        questions: updatedQuestions
      }
    })
  }
  
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions]
      const options = [...updatedQuestions[questionIndex].options]
      options[optionIndex] = value
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options
      }
      return {
        ...prev,
        questions: updatedQuestions
      }
    })
  }
  
  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions]
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        correctAnswer: optionIndex
      }
      return {
        ...prev,
        questions: updatedQuestions
      }
    })
  }
  
  const handleAddQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { 
          type: 'multiple', 
          question: '', 
          options: ['', '', '', ''], 
          correctAnswer: 0 
        }
      ]
    }))
  }
  
  const handleDeleteQuestion = (index) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions]
      updatedQuestions.splice(index, 1)
      return {
        ...prev,
        questions: updatedQuestions
      }
    })
  }
  
  const handleSave = async () => {
    // Validate quiz data
    if (!quiz.title) {
      showSnackbarMessage('Please enter a title for your quiz', 'error')
      return
    }
    
    if (!quiz.questions.length || quiz.questions.some(q => !q.question)) {
      showSnackbarMessage('Please ensure all questions have content', 'error')
      return
    }
    
    if (quiz.questions.some(q => 
      q.type === 'multiple' && 
      (q.options.some(opt => !opt) || q.options.length < 2)
    )) {
      showSnackbarMessage('Please ensure all multiple choice questions have at least two options', 'error')
      return
    }
    
    try {
      // Calculate estimated time based on question count (approx 30 sec per question)
      const estimatedTime = `${Math.max(5, Math.ceil(quiz.questions.length * 0.5))} min`
      
      // Update the quiz with any derived fields
      const updatedQuiz = {
        ...quiz,
        time: estimatedTime,
        questionCount: quiz.questions.length
      }
      
      // Send to server using React Query mutation
      updateQuiz(
        { id, quiz: updatedQuiz },
        {
          onSuccess: () => {
            showSnackbarMessage('Quiz saved successfully!', 'success');
          },
          onError: (err) => {
            logger.error('Error saving quiz:', { value: err });
            showSnackbarMessage('Failed to save changes. Please try again.', 'error');
          }
        }
      );
    } catch (err) {
      logger.error('Error saving quiz:', { value: err });
      showSnackbarMessage('Failed to save changes. Please try again.', 'error');
    }
  }
  
  const handleGoBack = () => {
    navigate('/quizzes')
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#00ff94] rounded-full animate-spin"></div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex flex-col justify-center items-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-white/80 mb-4">{error}</p>
          <button 
            onClick={handleGoBack}
            className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center"
          >
            <ArrowBackIcon fontSize="small" className="mr-1" /> Back to Quizzes
          </button>
        </div>
      </div>
    )
  }
  
  // No quiz found state
  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex flex-col justify-center items-center p-4">
        <div className="bg-[#18092a]/60 rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-2">Quiz Not Found</h2>
          <p className="text-white/80 mb-4">The quiz you're looking for doesn't exist or might have been deleted.</p>
          <button 
            onClick={handleGoBack}
            className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center"
          >
            <ArrowBackIcon fontSize="small" className="mr-1" /> Back to Quizzes
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <button 
            onClick={handleGoBack}
            className="bg-[#18092a]/60 text-white px-3 py-1.5 rounded-lg hover:bg-[#18092a] transition-colors border border-gray-800/30 inline-flex items-center"
          >
            <ArrowBackIcon fontSize="small" className="mr-1" /> Back
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg inline-flex items-center ${
              isSaving 
                ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
                : 'bg-[#00ff94]/10 text-[#00ff94] hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-[#00ff94] rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <SaveIcon fontSize="small" className="mr-1" /> Save Changes
              </>
            )}
          </button>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <EditIcon className="text-[#00ff94] mr-2" />
            <h1 className="text-2xl font-bold">Edit Quiz</h1>
          </div>
          
          {/* Title and description */}
          <div className="bg-[#18092a]/60 rounded-xl p-6 mb-6 border border-gray-800/30">
            <div className="mb-4">
              <label htmlFor="title" className="block text-white/70 mb-1 text-sm">Title</label>
              <input
                type="text"
                id="title"
                value={quiz.title || ''}
                onChange={handleTitleChange}
                className="w-full bg-[#15052a]/80 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-white/70 mb-1 text-sm">Description (optional)</label>
              <textarea
                id="description"
                value={quiz.description || ''}
                onChange={handleDescriptionChange}
                className="w-full bg-[#15052a]/80 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30 h-24 resize-none"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="difficulty" className="block text-white/70 mb-1 text-sm">Difficulty</label>
              <select
                id="difficulty"
                value={quiz.difficulty || 'Medium'}
                onChange={handleDifficultyChange}
                className="w-full bg-[#15052a]/80 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          
          {/* Questions */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Questions ({quiz.questions?.length || 0})</h2>
              <button
                onClick={handleAddQuestion}
                className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center"
              >
                <AddCircleOutlineIcon fontSize="small" className="mr-1" /> Add Question
              </button>
            </div>
            
            {quiz.questions?.map((question, qIndex) => (
              <div key={qIndex} className="bg-[#18092a]/60 rounded-xl p-5 border border-gray-800/30 relative">
                <button
                  onClick={() => handleDeleteQuestion(qIndex)}
                  className="absolute top-3 right-3 text-white/40 hover:text-white/70 transition-colors"
                >
                  <DeleteOutlineIcon />
                </button>
                
                <div className="mb-4">
                  <label className="block text-white/70 mb-1 text-sm">Question {qIndex + 1}</label>
                  <textarea
                    value={question.question || ''}
                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                    className="w-full bg-[#15052a]/80 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30 resize-none"
                    rows={2}
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-white/70 mb-1 text-sm">Question Type</label>
                  <select
                    value={question.type || 'multiple'}
                    onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
                    className="w-full bg-[#15052a]/80 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30"
                  >
                    <option value="multiple">Multiple Choice</option>
                    <option value="boolean">True/False</option>
                  </select>
                </div>
                
                <div className="mb-2">
                  <label className="block text-white/70 mb-1 text-sm">
                    Options (select the correct answer)
                  </label>
                  
                  <FormControl component="fieldset" className="w-full">
                    <RadioGroup
                      value={question.correctAnswer.toString()}
                      onChange={(e) => handleCorrectAnswerChange(qIndex, parseInt(e.target.value))}
                    >
                      {question.options?.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center mb-2">
                          <FormControlLabel
                            value={oIndex.toString()}
                            control={
                              <Radio 
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.5)',
                                  '&.Mui-checked': {
                                    color: '#00ff94',
                                  }
                                }}
                              />
                            }
                            label=""
                            sx={{ margin: 0 }}
                          />
                          <input
                            type="text"
                            value={option || ''}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            placeholder={question.type === 'boolean' ? (oIndex === 0 ? 'True' : 'False') : `Option ${oIndex + 1}`}
                            disabled={question.type === 'boolean'}
                            className="w-full bg-[#15052a]/80 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30"
                          />
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </div>
              </div>
            ))}
            
            {(!quiz.questions || quiz.questions.length === 0) && (
              <div className="bg-[#18092a]/60 rounded-xl p-8 text-center border border-gray-800/30">
                <p className="text-white/70 mb-4">No questions in this quiz yet. Add your first question to get started.</p>
                <button
                  onClick={handleAddQuestion}
                  className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center"
                >
                  <AddCircleOutlineIcon fontSize="small" className="mr-1" /> Add First Question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
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
    </div>
  )
}

export default EditQuiz 