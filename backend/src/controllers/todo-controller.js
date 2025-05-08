import Todo from '../models/todo-model.js';
import logger from '../utils/logger.js';
import { handleError } from '../utils/error-handlers.js';

// Create a new todo item
export const createTodo = async (req, res) => {
  try {
    const userId = req.user.id || req.user.auth0Id;
    
    // Create a new todo with the provided data and userId
    const todo = new Todo({
      ...req.body,
      userId
    });
    
    // Save the todo to the database
    await todo.save();
    
    res.status(201).json(todo);
  } catch (error) {
    handleError(res, error);
  }
};

// Get all todos for the authenticated user
export const getTodos = async (req, res) => {
  try {
    const userId = req.user.id || req.user.auth0Id;
    const { status, priority, sort, limit = 50, skip = 0 } = req.query;
    
    logger.debug('Get todos request:', { userId, query: req.query });
    
    // Build filter object
    const filter = { userId };
    
    // Add optional filters if provided
    if (status) {
      logger.debug('Status filter provided:', { value: status });
      // Check if status contains multiple values
      if (status.includes(',')) {
        const statusValues = status.split(',').map(s => s.trim());
        logger.debug('Multiple status values:', { value: statusValues });
        filter.status = { $in: statusValues };
      } else {
        filter.status = status;
      }
    }
    if (priority) filter.priority = priority;
    
    logger.debug('Final filter:', { value: filter });
    
    // Build sort object
    let sortObj = {};
    if (sort) {
      // Parse sort parameters (e.g., 'dueDate:asc,priority:desc')
      sort.split(',').forEach(sortParam => {
        const [field, order] = sortParam.split(':');
        sortObj[field] = order === 'desc' ? -1 : 1;
      });
    } else {
      // Default sort: Incomplete first, then by due date (if exists), then by priority
      sortObj = { isCompleted: 1, dueDate: 1, priority: -1 };
    }
    
    logger.debug('Sort object:', { value: sortObj });
    
    // Get todos with pagination
    const todos = await Todo.find(filter)
      .sort(sortObj)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();
    
    logger.debug(`Found ${todos.length} todos with filter`);
    
    // Get total count for pagination
    const totalCount = await Todo.countDocuments(filter);
    
    res.status(200).json({
      todos,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    logger.error('Error in getTodos:', error);
    handleError(res, error);
  }
};

// Get a single todo by ID
export const getTodoById = async (req, res) => {
  try {
    const userId = req.user.id || req.user.auth0Id;
    const todoId = req.params.id;
    
    const todo = await Todo.findOne({ _id: todoId, userId });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.status(200).json(todo);
  } catch (error) {
    handleError(res, error);
  }
};

// Update a todo
export const updateTodo = async (req, res) => {
  try {
    const userId = req.user.id || req.user.auth0Id;
    const todoId = req.params.id;
    
    // Disallow updating userId
    const { userId: _, ...updates } = req.body;
    
    const todo = await Todo.findOneAndUpdate(
      { _id: todoId, userId },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.status(200).json(todo);
  } catch (error) {
    handleError(res, error);
  }
};

// Toggle todo completion status
export const toggleTodoCompletion = async (req, res) => {
  try {
    const userId = req.user.id || req.user.auth0Id;
    const todoId = req.params.id;
    
    // Find the todo first to get its current state
    const todo = await Todo.findOne({ _id: todoId, userId });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    // Toggle the isCompleted status
    todo.isCompleted = !todo.isCompleted;
    
    // If completed, update status and completedAt date
    if (todo.isCompleted) {
      todo.status = 'completed';
      todo.completedAt = new Date();
    } else {
      // If marking as incomplete, revert to either pending or in-progress
      todo.status = todo.status === 'completed' ? 'pending' : todo.status;
      todo.completedAt = undefined;
    }
    
    await todo.save();
    
    res.status(200).json(todo);
  } catch (error) {
    handleError(res, error);
  }
};

// Delete a todo
export const deleteTodo = async (req, res) => {
  try {
    const userId = req.user.id || req.user.auth0Id;
    const todoId = req.params.id;
    
    const todo = await Todo.findOneAndDelete({ _id: todoId, userId });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete all completed todos
export const deleteCompletedTodos = async (req, res) => {
  try {
    const userId = req.user.id || req.user.auth0Id;
    
    const result = await Todo.deleteMany({ 
      userId, 
      isCompleted: true 
    });
    
    res.status(200).json({ 
      message: 'Completed todos deleted successfully',
      count: result.deletedCount
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get todo statistics
export const getTodoStats = async (req, res) => {
  try {
    const userId = req.user.id || req.user.auth0Id;
    
    // Get counts by status
    const stats = await Todo.aggregate([
      { $match: { userId } },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get priority distribution
    const priorityStats = await Todo.aggregate([
      { $match: { userId } },
      { $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get overdue count
    const overdue = await Todo.countDocuments({
      userId,
      dueDate: { $lt: new Date() },
      isCompleted: false
    });
    
    // Format the stats in a more user-friendly way
    const formattedStats = {
      total: 0,
      pending: 0,
      'in-progress': 0,
      completed: 0,
      archived: 0,
      overdue,
      priority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      }
    };
    
    // Fill in the status counts
    stats.forEach(item => {
      formattedStats[item._id] = item.count;
      formattedStats.total += item.count;
    });
    
    // Fill in the priority counts
    priorityStats.forEach(item => {
      formattedStats.priority[item._id] = item.count;
    });
    
    res.status(200).json(formattedStats);
  } catch (error) {
    handleError(res, error);
  }
}; 