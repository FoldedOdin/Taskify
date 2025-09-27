import express from 'express';
import { Todo } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all todo routes
router.use(authenticateToken);

// GET /todos/search - Search todos for authenticated user
router.get('/search', async (req, res) => {
  try {
    const { q, category, priority, completed } = req.query;
    
    // Build search query
    const searchQuery = { userId: req.userId };
    
    // Add text search if query provided
    if (q && q.trim()) {
      searchQuery.text = { $regex: q.trim(), $options: 'i' }; // Case-insensitive search
    }
    
    // Add category filter
    if (category && category !== 'All') {
      searchQuery.category = category;
    }
    
    // Add priority filter
    if (priority && priority !== 'All') {
      searchQuery.priority = priority;
    }
    
    // Add completed filter
    if (completed !== undefined && completed !== 'All') {
      searchQuery.completed = completed === 'true';
    }
    
    const todos = await Todo.find(searchQuery).sort({ order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: todos,
      count: todos.length,
      query: { q, category, priority, completed }
    });
  } catch (error) {
    console.error('Error searching todos:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to search todos',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

// PUT /todos/reorder - Update the order of multiple todos (must come before /:id route)
router.put('/reorder', async (req, res) => {
  try {
    const { todoOrders } = req.body;

    // Validate input
    if (!Array.isArray(todoOrders) || todoOrders.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'todoOrders must be a non-empty array',
          field: 'todoOrders'
        }
      });
    }

    // Validate each todo order entry
    for (const item of todoOrders) {
      if (!item.id || typeof item.order !== 'number') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Each todo order entry must have id and order fields',
            field: 'todoOrders'
          }
        });
      }

      // Validate ObjectId format
      if (!item.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid todo ID format',
            field: 'id',
            invalidId: item.id
          }
        });
      }
    }

    // Update todos in bulk using Promise.all for better performance
    const updatePromises = todoOrders.map(({ id, order }) =>
      Todo.findOneAndUpdate(
        { _id: id, userId: req.userId },
        { order },
        { new: true, runValidators: true }
      )
    );

    const updatedTodos = await Promise.all(updatePromises);

    // Check if any todos were not found (null results)
    const notFoundTodos = todoOrders.filter((_, index) => !updatedTodos[index]);
    if (notFoundTodos.length > 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Some todos not found or access denied',
          notFoundIds: notFoundTodos.map(item => item.id)
        }
      });
    }

    res.json({
      success: true,
      data: updatedTodos.filter(todo => todo !== null),
      message: 'Todo order updated successfully',
      updatedCount: updatedTodos.length
    });
  } catch (error) {
    console.error('Error reordering todos:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to reorder todos',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

// GET /todos - Fetch all todos for authenticated user
router.get('/', async (req, res) => {
  try {
    const { category, priority, completed } = req.query;
    
    // Build query with filters
    const query = { userId: req.userId };
    
    // Add filters if provided
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    
    if (completed !== undefined && completed !== 'All') {
      query.completed = completed === 'true';
    }
    
    const todos = await Todo.find(query).sort({ order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: todos,
      count: todos.length
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch todos',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

// POST /todos - Create a new todo
router.post('/', async (req, res) => {
  try {
    const { text, category, priority, dueDate } = req.body;

    // Validate required fields
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Todo text is required',
          field: 'text'
        }
      });
    }

    // Get the highest order value for this user to set new todo at the end
    const highestOrderTodo = await Todo.findOne({ userId: req.userId }).sort({ order: -1 });
    const nextOrder = highestOrderTodo ? highestOrderTodo.order + 1 : 0;

    // Create new todo with authenticated user's ID
    const todoData = {
      text: text.trim(),
      completed: false,
      userId: req.userId,
      order: nextOrder
    };

    // Add optional fields if provided
    if (category) todoData.category = category;
    if (priority) todoData.priority = priority;
    if (dueDate) todoData.dueDate = new Date(dueDate);

    const newTodo = new Todo(todoData);
    const savedTodo = await newTodo.save();

    res.status(201).json({
      success: true,
      data: savedTodo,
      message: 'Todo created successfully'
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: validationErrors
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create todo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

// PUT /todos/:id - Update an existing todo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed, category, priority, dueDate } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid todo ID format',
          field: 'id'
        }
      });
    }

    // Find the todo and ensure it belongs to the authenticated user
    const todo = await Todo.findOne({ _id: id, userId: req.userId });
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Todo not found or access denied',
          id: id
        }
      });
    }

    // Update fields if provided
    const updateData = {};
    if (text !== undefined) updateData.text = text.trim();
    if (completed !== undefined) updateData.completed = Boolean(completed);
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    // Validate text if it's being updated
    if (updateData.text !== undefined && updateData.text.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Todo text cannot be empty',
          field: 'text'
        }
      });
    }

    // Update the todo (ensure it belongs to the authenticated user)
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedTodo,
      message: 'Todo updated successfully'
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: validationErrors
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update todo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

// DELETE /todos/:id - Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid todo ID format',
          field: 'id'
        }
      });
    }

    // Find and delete the todo (ensure it belongs to the authenticated user)
    const deletedTodo = await Todo.findOneAndDelete({ _id: id, userId: req.userId });
    
    if (!deletedTodo) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Todo not found or access denied',
          id: id
        }
      });
    }

    res.json({
      success: true,
      data: deletedTodo,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete todo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

export default router;