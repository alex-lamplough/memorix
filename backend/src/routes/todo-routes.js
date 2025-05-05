import express from 'express';
import { checkJwt, getUserFromToken, requireCompletedOnboarding } from '../middleware/auth-middleware.js';
import { validateRequest } from '../middleware/validation.js';
import { lookupMongoUser } from '../middleware/user-middleware.js';
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  toggleTodoCompletion,
  deleteTodo,
  deleteCompletedTodos,
  getTodoStats
} from '../controllers/todo-controller.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(checkJwt);
router.use(getUserFromToken);
// Add the MongoDB user lookup middleware to get proper user._id
router.use(lookupMongoUser);
// Enforce onboarding completion for all todo routes
router.use(requireCompletedOnboarding);

/**
 * @route GET /api/todos
 * @desc Get all todos for the authenticated user
 * @access Private
 */
router.get('/', getTodos);

/**
 * @route GET /api/todos/stats
 * @desc Get todo statistics for the authenticated user
 * @access Private
 */
router.get('/stats', getTodoStats);

/**
 * @route POST /api/todos
 * @desc Create a new todo
 * @access Private
 */
router.post('/', validateRequest({
  body: {
    title: { type: 'string', required: true },
    description: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'in-progress', 'completed', 'archived'] },
    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
    dueDate: { type: 'date' },
    isCompleted: { type: 'boolean' },
    related: { type: 'object' }
  }
}), createTodo);

/**
 * @route GET /api/todos/:id
 * @desc Get a single todo by ID
 * @access Private
 */
router.get('/:id', getTodoById);

/**
 * @route PUT /api/todos/:id
 * @desc Update a todo
 * @access Private
 */
router.put('/:id', validateRequest({
  body: {
    title: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'in-progress', 'completed', 'archived'] },
    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
    dueDate: { type: 'date' },
    isCompleted: { type: 'boolean' },
    related: { type: 'object' }
  }
}), updateTodo);

/**
 * @route PATCH /api/todos/:id/toggle
 * @desc Toggle todo completion status
 * @access Private
 */
router.patch('/:id/toggle', toggleTodoCompletion);

/**
 * @route DELETE /api/todos/:id
 * @desc Delete a todo
 * @access Private
 */
router.delete('/:id', deleteTodo);

/**
 * @route DELETE /api/todos/completed
 * @desc Delete all completed todos
 * @access Private
 */
router.delete('/completed', deleteCompletedTodos);

export default router; 