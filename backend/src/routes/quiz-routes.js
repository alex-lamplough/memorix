import express from 'express';
import { checkJwt, getUserFromToken } from '../middleware/auth-middleware.js';
import { lookupMongoUser } from '../middleware/user-middleware.js';
import quizController from '../controllers/quiz-controller.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(checkJwt);
router.use(getUserFromToken);
router.use(lookupMongoUser);

// Route: GET /api/quizzes
// Description: Get all quizzes for the authenticated user
router.get('/', quizController.getAllQuizzes);

// Route: GET /api/quizzes/public
// Description: Get public quizzes with pagination, filtering and search
router.get('/public', quizController.getPublicQuizzes);

// Route: GET /api/quizzes/:id
// Description: Get a specific quiz by ID
router.get('/:id', quizController.getQuizById);

// Route: POST /api/quizzes
// Description: Create a new quiz
router.post('/', quizController.createQuiz);

// Route: PUT /api/quizzes/:id
// Description: Update an existing quiz
router.put('/:id', quizController.updateQuiz);

// Route: DELETE /api/quizzes/:id
// Description: Delete a quiz
router.delete('/:id', quizController.deleteQuiz);

export default router; 