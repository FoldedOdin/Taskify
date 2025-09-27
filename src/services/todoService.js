import apiClient from '../utils/api.js';
import { createStandardError, OPERATION_ERRORS } from '../utils/errorHandler.js';

// Utility function to handle API responses consistently
const handleApiResponse = (response) => {
  // Return the backend response structure directly
  // Backend returns: { success: true, data: actualData, count?: number, message?: string }
  // Components expect to access response.data to get the actual todo data
  return response.data;
};

// Utility function to extract error messages from API error responses
const handleApiError = (error, operation, context = {}) => {
  // Create standardized error with logging
  const standardError = createStandardError(error, operation, context);
  
  // Create a new error with the user-friendly message
  const apiError = new Error(standardError.message);
  apiError.originalError = error;
  apiError.response = error.response;
  apiError.type = standardError.type;
  apiError.operation = operation;
  apiError.context = context;
  
  throw apiError;
};

// Fetch all todos
export const fetchTodos = async () => {
  try {
    const response = await apiClient.get('/todos');
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error, 'FETCH_TODOS', { endpoint: '/todos' });
  }
};

// Create a new todo
export const createTodo = async (todoData) => {
  try {
    const response = await apiClient.post('/todos', todoData);
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error, 'CREATE_TODO', { todoData });
  }
};

// Update an existing todo
export const updateTodo = async (id, updateData) => {
  try {
    const response = await apiClient.put(`/todos/${id}`, updateData);
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error, 'UPDATE_TODO', { id, updateData });
  }
};

// Delete a todo
export const deleteTodo = async (id) => {
  try {
    const response = await apiClient.delete(`/todos/${id}`);
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error, 'DELETE_TODO', { id });
  }
};

// Search todos with filters
export const searchTodos = async (searchQuery, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (searchQuery && searchQuery.trim()) {
      params.append('q', searchQuery.trim());
    }
    
    if (filters.category) {
      params.append('category', filters.category);
    }
    
    if (filters.priority) {
      params.append('priority', filters.priority);
    }
    
    if (filters.completed !== undefined) {
      params.append('completed', filters.completed);
    }
    
    const response = await apiClient.get(`/todos/search?${params.toString()}`);
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error, 'SEARCH_TODOS', { searchQuery, filters });
  }
};

// Fetch todos with filters (without search text)
export const fetchTodosWithFilters = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.category) {
      params.append('category', filters.category);
    }
    
    if (filters.priority) {
      params.append('priority', filters.priority);
    }
    
    if (filters.completed !== undefined) {
      params.append('completed', filters.completed);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/todos?${queryString}` : '/todos';
    
    const response = await apiClient.get(url);
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error, 'FETCH_TODOS', { filters });
  }
};

// Reorder todos
export const reorderTodos = async (todoOrders) => {
  try {
    const response = await apiClient.put('/todos/reorder', { todoOrders });
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error, 'REORDER_TODOS', { todoOrders });
  }
};