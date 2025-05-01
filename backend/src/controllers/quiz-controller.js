import mongoose from 'mongoose';
import Quiz from '../models/quiz-model.js';
import logger from '../utils/logger.js';

/**
 * Get all quizzes for the authenticated user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllQuizzes = async (req, res) => {
  try {
    logger.info('Fetching quizzes for user', { userId: req.user.id });
    
    // Find all quizzes belonging to the user
    const quizzes = await Quiz.find({ userId: req.user.id })
      .select('-questions') // Don't return questions to reduce payload size
      .sort({ updatedAt: -1 });
    
    logger.info(`Found ${quizzes.length} quizzes for user`);
    
    // Format the response
    const formattedQuizzes = quizzes.map(quiz => ({
      ...quiz.toObject(),
      totalQuestions: quiz.questionCount || 0,
      // Check if the current user has favorited this quiz
      isFavorite: quiz.favorites && Array.isArray(quiz.favorites) && 
                 quiz.favorites.some(favId => 
                   req.user.mongoUser ? 
                   favId.equals(req.user.mongoUser._id) : 
                   favId.equals(req.user.id)
                 )
    }));
    
    return res.status(200).json(formattedQuizzes);
  } catch (error) {
    logger.error('Error fetching quizzes:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch quizzes',
      message: error.message
    });
  }
};

/**
 * Get a specific quiz by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid quiz ID format' 
      });
    }
    
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        error: 'Quiz not found' 
      });
    }
    
    // Check if the user is authorized to access this quiz
    if (String(quiz.userId) !== String(req.user.id) && !quiz.isPublic) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to access this quiz' 
      });
    }
    
    // Convert to object and add isFavorite flag
    const quizData = quiz.toObject();
    quizData.isFavorite = quiz.favorites && Array.isArray(quiz.favorites) && 
                        quiz.favorites.some(favId => 
                          req.user.mongoUser ? 
                          favId.equals(req.user.mongoUser._id) : 
                          favId.equals(req.user.id)
                        );

    return res.status(200).json({
      success: true,
      data: quizData
    });
  } catch (error) {
    logger.error('Error fetching quiz by ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz',
      message: error.message
    });
  }
};

/**
 * Create a new quiz
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createQuiz = async (req, res) => {
  try {
    logger.info('Creating new quiz for user', { userId: req.user.id });
    
    // Validate required fields
    const { title, questions } = req.body;
    
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title is required' 
      });
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one question is required' 
      });
    }
    
    // Create a new quiz document
    const newQuiz = new Quiz({
      ...req.body,
      userId: req.user.id,
      questionCount: questions.length
    });
    
    // Save to database
    await newQuiz.save();
    
    logger.info('Successfully created quiz', { quizId: newQuiz._id });
    
    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: newQuiz
    });
  } catch (error) {
    logger.error('Error creating quiz:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create quiz',
      message: error.message
    });
  }
};

/**
 * Update an existing quiz
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid quiz ID format' 
      });
    }
    
    // Find the quiz
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        error: 'Quiz not found' 
      });
    }
    
    // Check if user is authorized to update
    if (String(quiz.userId) !== String(req.user.id)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to update this quiz' 
      });
    }
    
    // Update the quiz
    Object.keys(req.body).forEach(key => {
      // Don't allow changing userId
      if (key !== 'userId' && key !== '_id') {
        quiz[key] = req.body[key];
      }
    });
    
    // Update questionCount if questions array was updated
    if (req.body.questions) {
      quiz.questionCount = req.body.questions.length;
    }
    
    // Save the updated quiz
    await quiz.save();
    
    logger.info('Successfully updated quiz', { quizId: id });
    
    return res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    logger.error('Error updating quiz:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update quiz',
      message: error.message
    });
  }
};

/**
 * Delete a quiz
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`Attempting to delete quiz with ID: ${id}`, { 
      userId: req.user.id 
    });
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.error(`Invalid quiz ID format: ${id}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid quiz ID format' 
      });
    }
    
    // Find the quiz
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      logger.error(`Quiz not found with ID: ${id}`);
      return res.status(404).json({ 
        success: false, 
        error: 'Quiz not found' 
      });
    }
    
    // Log user and quiz IDs for debugging
    logger.info(`Quiz owner ID: ${quiz.userId}, Current user ID: ${req.user.id}`);
    
    // Check if user is authorized to delete
    // Convert both IDs to strings before comparison to ensure consistency
    if (String(quiz.userId) !== String(req.user.id)) {
      logger.error(`Unauthorized attempt to delete quiz. Quiz owner: ${quiz.userId}, Current user: ${req.user.id}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to delete this quiz' 
      });
    }
    
    // Delete the quiz
    const deleteResult = await Quiz.findByIdAndDelete(id);
    logger.info(`Delete result: ${deleteResult ? 'Success' : 'Failed'}`);
    
    logger.info('Successfully deleted quiz', { quizId: id });
    
    return res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting quiz:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete quiz',
      message: error.message
    });
  }
};

/**
 * Get public quizzes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPublicQuizzes = async (req, res) => {
  try {
    const { limit = 20, page = 1, category, search } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isPublic: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const quizzes = await Quiz.find(query)
      .select('-questions')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 })
      .populate('userId', 'name picture');
    
    const total = await Quiz.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      data: quizzes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching public quizzes:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch public quizzes',
      message: error.message
    });
  }
};

export default {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getPublicQuizzes
}; 