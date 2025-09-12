import express from 'express';
import { Todo } from '../models/index.js';

const router = express.Router();

// GET /todos - Fetch all todos
router.get('/', async (req, res) => {
  try {
    // For now, fetch all todos (will be user-specific later with authentication)
    const todos = await Todo.find({}).sort({ createdAt: -1 });
    
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

    // Create new todo (userId will be added later with authentication)
    const todoData = {
      text: text.trim(),
      completed: false,
      // Temporary userId for testing - will be replaced with authenticated user ID
      userId: '507f1f77bcf86cd799439011' // Placeholder ObjectId
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

    // Find the todo
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Todo not found',
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

    // Update the todo
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
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

    // Find and delete the todo
    const deletedTodo = await Todo.findByIdAndDelete(id);
    
    if (!deletedTodo) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Todo not found',
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