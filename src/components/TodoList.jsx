import React, { useState, useEffect, useCallback } from 'react';
import AddTodo from './AddTodo';
import TodoItem from './TodoItem';
import DragDropList from './DragDropList';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import DebugPanel from './DebugPanel';
import { fetchTodos, createTodo, updateTodo, deleteTodo, searchTodos, fetchTodosWithFilters, reorderTodos } from '../services/todoService';
import { createOperationStateManager } from '../utils/operationStateManager';
import { createTodoRetryMechanisms, manualRetry } from '../utils/retryMechanism';
import { createStandardError } from '../utils/errorHandler';
import { debugLogger, performanceMonitor, operationDebugger, stateDebugger } from '../utils/debugUtils';
import { prodLogger, criticalLogger } from '../utils/productionLogger';
import { getAllCategories, extractAndSaveTagsFromTodos } from '../utils/tagsManager';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Enhanced error state with retry tracking
  const [errorState, setErrorState] = useState({
    error: null,
    operation: null,
    retryAttempts: 0,
    canRetry: false
  });
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Loading states for individual operations
  const [operationLoading, setOperationLoading] = useState({
    creating: false,
    updating: new Set(),
    deleting: new Set(),
    toggling: new Set(),
    reordering: false,
    searching: false
  });

  // Initialize operation state manager with timeout and concurrency controls
  const operationStateManager = createOperationStateManager(setOperationLoading, {
    timeouts: {
      creating: 15000,    // 15 seconds for create operations
      updating: 10000,    // 10 seconds for update operations
      deleting: 10000,    // 10 seconds for delete operations
      toggling: 8000,     // 8 seconds for toggle operations
      reordering: 12000,  // 12 seconds for reorder operations
      searching: 5000     // 5 seconds for search operations
    },
    maxConcurrent: {
      creating: 1,        // Only one create at a time
      updating: 5,        // Up to 5 updates simultaneously
      deleting: 5,        // Up to 5 deletes simultaneously
      toggling: 10,       // Up to 10 toggles simultaneously
      reordering: 1,      // Only one reorder at a time
      searching: 1        // Only one search at a time
    }
  });

  // Initialize retry mechanisms for different operations
  const retryMechanisms = createTodoRetryMechanisms({
    maxAttempts: 3,
    baseDelay: 1000
  });

  // Reset loading states on component mount to prevent stuck states
  useEffect(() => {
    stateDebugger.logMount('TodoList', { todosCount: todos.length });
    debugLogger.info('LIFECYCLE', 'TodoList component mounted - resetting loading states');
    
    operationStateManager.resetAllLoadingStates();
    
    // Initialize available categories
    setAvailableCategories(['All', ...getAllCategories()]);
    
    // Cleanup on unmount
    return () => {
      stateDebugger.logUnmount('TodoList');
      debugLogger.info('LIFECYCLE', 'TodoList component unmounting - cleaning up');
      operationStateManager.cleanup();
    };
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    stateDebugger.logStateChange('TodoList', 'todos', null, todos);
    debugLogger.debug('STATE', 'Todos state changed', { 
      count: todos.length,
      activeCount: todos.filter(t => !t.completed).length,
      completedCount: todos.filter(t => t.completed).length
    });
    
    // Extract tags from todos and update available categories
    extractAndSaveTagsFromTodos(todos);
    const newCategories = ['All', ...getAllCategories()];
    setAvailableCategories(newCategories);
    console.log('📂 Updated available categories:', newCategories);
  }, [todos]);

  useEffect(() => {
    stateDebugger.logStateChange('TodoList', 'operationLoading', null, operationLoading);
    debugLogger.debug('STATE', 'Operation loading state changed', operationLoading);
  }, [operationLoading]);

  useEffect(() => {
    if (error) {
      stateDebugger.logStateChange('TodoList', 'error', null, error);
      debugLogger.warn('STATE', 'Error state changed', { error });
    }
  }, [error]);

  // Helper functions using the operation state manager
  const setOperationLoadingWithTimeout = operationStateManager.setOperationLoadingWithTimeout;
  const isOperationLoading = (operation, id = null) => 
    operationStateManager.isOperationLoading(operation, id, operationLoading);
  const canProceedWithOperation = (operation) => 
    operationStateManager.canProceedWithOperation(operation, operationLoading);

  // Enhanced error handling helpers
  const handleOperationError = (error, operation, context = {}) => {
    const standardError = createStandardError(error, operation, context);
    
    setErrorState({
      error: standardError,
      operation,
      retryAttempts: context.retryAttempts || 0,
      canRetry: standardError.type === 'network' || standardError.type === 'server'
    });
    
    // Also set the legacy error for backward compatibility
    setError(standardError.message);
    
    return standardError;
  };

  const clearError = () => {
    setError(null);
    setErrorState({
      error: null,
      operation: null,
      retryAttempts: 0,
      canRetry: false
    });
  };

  const retryLastOperation = async () => {
    if (!errorState.canRetry || !errorState.operation) return;
    
    console.log(`🔄 Retrying last operation: ${errorState.operation}`);
    
    try {
      switch (errorState.operation) {
        case 'FETCH_TODOS':
          await loadTodos();
          break;
        case 'SEARCH_TODOS':
          await handleSearch();
          break;
        default:
          console.warn('Unknown operation for retry:', errorState.operation);
      }
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      handleOperationError(retryError, errorState.operation, { 
        retryAttempts: errorState.retryAttempts + 1 
      });
    }
  };

  // Load todos from API on component mount and when filters change
  useEffect(() => {
    loadTodos();
  }, [selectedCategory]);

  // Debug: Log component mount and operation loading state changes (development only)
  useEffect(() => {
    prodLogger.log('🔧 TodoList component mounted/updated');
    prodLogger.log('📊 Current todos count:', todos.length);
    prodLogger.log('📊 Current operation loading states:', operationLoading);
    prodLogger.log('🎯 Event handlers verification:');
    prodLogger.log('  - toggleComplete function exists:', typeof toggleComplete === 'function');
    prodLogger.log('  - handleDeleteTodo function exists:', typeof handleDeleteTodo === 'function');
    
    // Verify event handlers are properly bound by checking if they're functions
    if (typeof toggleComplete !== 'function') {
      criticalLogger.error('❌ toggleComplete is not a function!');
    }
    if (typeof handleDeleteTodo !== 'function') {
      criticalLogger.error('❌ handleDeleteTodo is not a function!');
    }
  }, [todos.length, operationLoading]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else if (selectedCategory) {
      loadTodos();
    } else {
      loadTodos();
    }
  }, [searchQuery]);

  const loadTodos = async () => {
    const operationId = `loadTodos-${Date.now()}`;
    performanceMonitor.startOperation(operationId, { 
      category: 'fetch',
      selectedCategory,
      operation: 'loadTodos'
    });
    
    operationDebugger.logStateChange('loadTodos', 'started', { selectedCategory });
    
    try {
      setLoading(true);
      clearError();
      setIsSearching(false);
      
      debugLogger.info('OPERATION', 'Loading todos', { selectedCategory });
      
      // Use retry mechanism for loading todos
      const response = await retryMechanisms.retrySearch(async () => {
        if (selectedCategory) {
          debugLogger.debug('API', 'Fetching todos with filters', { category: selectedCategory });
          return await fetchTodosWithFilters({ category: selectedCategory });
        } else {
          debugLogger.debug('API', 'Fetching all todos');
          return await fetchTodos();
        }
      });
      
      const todosData = response.data || [];
      setTodos(todosData);
      
      operationDebugger.logSuccess('loadTodos', { 
        count: todosData.length,
        hasCategory: !!selectedCategory 
      });
      
      performanceMonitor.endOperation(operationId, { 
        todosLoaded: todosData.length,
        success: true 
      });
      
    } catch (err) {
      debugLogger.error('OPERATION', 'Failed to load todos', { 
        error: err.message,
        selectedCategory,
        stack: err.stack 
      });
      
      operationDebugger.logFailure('loadTodos', err, { selectedCategory });
      performanceMonitor.failOperation(operationId, err);
      
      handleOperationError(err, 'FETCH_TODOS', { selectedCategory });
      
      // For development: set some mock data when server is not available
      if (err.message === 'API Error' || err.code === 'NETWORK_ERROR') {
        const mockTodos = [
          {
            _id: '1',
            text: 'Sample todo (offline mode)',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: null,
            category: 'Personal',
            priority: 'Medium',
          },
        ];
        setTodos(mockTodos);
        debugLogger.warn('FALLBACK', 'Using mock data due to API error', { mockCount: mockTodos.length });
      }
    } finally {
      setLoading(false);
      debugLogger.debug('OPERATION', 'Load todos operation completed');
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadTodos();
      return;
    }

    // Prevent multiple simultaneous search operations
    if (isOperationLoading('searching') || !canProceedWithOperation('searching')) {
      console.log('⚠️ Search operation blocked - already in progress');
      return;
    }

    try {
      setOperationLoadingWithTimeout('searching', true);
      setIsSearching(true);
      setError(null);
      
      const filters = {};
      if (selectedCategory) {
        filters.category = selectedCategory;
      }
      
      // Use retry mechanism for search
      const response = await retryMechanisms.retrySearch(async () => {
        return await searchTodos(searchQuery, filters);
      });
      
      setTodos(response.data || []);
      clearError(); // Clear any previous errors on success
    } catch (err) {
      console.error('Failed to search todos:', err);
      
      handleOperationError(err, 'SEARCH_TODOS', { searchQuery, filters });
    } finally {
      setOperationLoadingWithTimeout('searching', false);
      setIsSearching(false);
    }
  }, [searchQuery, selectedCategory]);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const addTodo = async (text, dueAt, tags = []) => {
    const operationId = `addTodo-${Date.now()}`;
    
    // Prevent multiple simultaneous create operations using enhanced safeguards
    if (isOperationLoading('creating') || !canProceedWithOperation('creating')) {
      operationDebugger.logBlocked('addTodo', 'already in progress or concurrency limit reached', { text });
      debugLogger.warn('OPERATION', 'Create operation blocked', { text, reason: 'concurrency' });
      return;
    }

    performanceMonitor.startOperation(operationId, { 
      category: 'create',
      operation: 'addTodo',
      textLength: text.length,
      hasDueDate: !!dueAt
    });
    
    operationDebugger.logStateChange('addTodo', 'started', { text, dueAt });

    // Create a temporary todo for optimistic updates
    const tempTodo = {
      _id: Date.now().toString(), // Temporary ID
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: dueAt,
      category: 'Personal',
      priority: 'Medium',
    };

    try {
      setOperationLoadingWithTimeout('creating', true);
      debugLogger.info('OPERATION', 'Starting todo creation', { text, dueAt, tempId: tempTodo._id });
      
      // Add the new todo to the local state immediately for optimistic updates
      setTodos(prevTodos => [tempTodo, ...prevTodos]);
      debugLogger.debug('STATE', 'Applied optimistic update for new todo', { tempId: tempTodo._id });

      // Create todo data object for API call
      const todoData = {
        text,
        dueDate: dueAt,
        category: 'Personal',
        priority: 'Medium',
        tags: tags || [],
      };

      // API call to create todo with retry mechanism
      debugLogger.debug('API', 'Creating todo via API', todoData);
      const response = await retryMechanisms.retryCreate(async () => {
        return await createTodo(todoData);
      });
      
      const createdTodo = response.data || response;
      debugLogger.debug('API', 'Todo created successfully', { 
        tempId: tempTodo._id, 
        realId: createdTodo.id 
      });

      // Replace the temporary todo with the actual todo from the server
      setTodos(prevTodos =>
        prevTodos.map(t => (t._id === tempTodo._id ? createdTodo : t))
      );

      // Clear any previous errors
      clearError();
      
      operationDebugger.logSuccess('addTodo', { 
        todoId: createdTodo.id,
        text: createdTodo.text 
      });
      
      performanceMonitor.endOperation(operationId, { 
        todoId: createdTodo.id,
        success: true 
      });
      
    } catch (err) {
      debugLogger.error('OPERATION', 'Failed to create todo', { 
        error: err.message,
        text,
        dueAt,
        stack: err.stack 
      });
      
      // Remove the temporary todo on error
      setTodos(prevTodos => prevTodos.filter(t => t._id !== tempTodo._id));
      debugLogger.debug('STATE', 'Reverted optimistic update due to error', { tempId: tempTodo._id });
      
      operationDebugger.logFailure('addTodo', err, { text, dueAt });
      performanceMonitor.failOperation(operationId, err);
      
      handleOperationError(err, 'CREATE_TODO', { text, dueAt });
    } finally {
      setOperationLoadingWithTimeout('creating', false);
      debugLogger.debug('OPERATION', 'Add todo operation completed');
    }
  };

  const toggleComplete = async id => {
    const operationId = `toggleComplete-${id}-${Date.now()}`;
    
    debugLogger.info('OPERATION', 'Toggle complete called', { id });
    debugLogger.debug('STATE', 'Current operation loading state', operationLoading);
    
    // Prevent multiple simultaneous toggle operations on the same todo using enhanced safeguards
    if (isOperationLoading('toggling', id) || !canProceedWithOperation('toggling')) {
      operationDebugger.logBlocked('toggleComplete', 'already in progress or concurrency limit reached', { id });
      debugLogger.warn('OPERATION', 'Toggle operation blocked', { id, reason: 'concurrency' });
      return;
    }

    const todo = todos.find(t => t.id === id);
    if (!todo) {
      debugLogger.error('OPERATION', 'Todo not found for toggle', { id });
      operationDebugger.logFailure('toggleComplete', new Error('Todo not found'), { id });
      return;
    }

    debugLogger.debug('OPERATION', 'Todo found for toggle', { 
      id: todo.id, 
      text: todo.text, 
      completed: todo.completed 
    });

    // Store the original completed state for potential rollback
    const originalCompleted = todo.completed;
    const newCompleted = !originalCompleted;
    
    performanceMonitor.startOperation(operationId, { 
      category: 'toggle',
      operation: 'toggleComplete',
      todoId: id,
      originalCompleted,
      newCompleted
    });
    
    operationDebugger.logStateChange('toggleComplete', 'started', { 
      id, 
      originalCompleted, 
      newCompleted 
    });
    
    debugLogger.info('OPERATION', 'Toggling completion state', { 
      id, 
      from: originalCompleted, 
      to: newCompleted 
    });

    try {
      debugLogger.debug('OPERATION', 'Starting toggle operation', { id });
      setOperationLoadingWithTimeout('toggling', true, id, 8000);
      debugLogger.debug('STATE', 'Loading state set for toggle operation', { id });

      // Optimistic update - but keep the todo in its current section during loading
      debugLogger.debug('STATE', 'Applying optimistic update', { id, newCompleted });
      setTodos(prevTodos =>
        prevTodos.map(t =>
          t.id === id ? { ...t, completed: newCompleted, updatedAt: new Date().toISOString() } : t
        )
      );

      // API call with retry mechanism and proper response handling
      debugLogger.debug('API', 'Making API call to update todo completion', { id, completed: newCompleted });
      const response = await retryMechanisms.retryToggle(async () => {
        return await updateTodo(id, { completed: newCompleted });
      });
      debugLogger.debug('API', 'Toggle API call successful', { id, response });
      
      // Update with the actual data from the server to ensure consistency
      if (response && response.data) {
        debugLogger.debug('STATE', 'Updating with server data', { id, serverData: response.data });
        setTodos(prevTodos =>
          prevTodos.map(t =>
            t.id === id ? { ...response.data, updatedAt: new Date().toISOString() } : t
          )
        );
      } else {
        // If no response.data, ensure the optimistic update is maintained
        debugLogger.debug('STATE', 'No server data, maintaining optimistic update', { id });
        setTodos(prevTodos =>
          prevTodos.map(t =>
            t.id === id ? { ...t, completed: newCompleted, updatedAt: new Date().toISOString() } : t
          )
        );
      }
      
      // Clear any previous errors on success
      clearError();
      
      operationDebugger.logSuccess('toggleComplete', { 
        id, 
        completed: newCompleted 
      });
      
      performanceMonitor.endOperation(operationId, { 
        id, 
        completed: newCompleted,
        success: true 
      });
      
      debugLogger.info('OPERATION', 'Toggle operation completed successfully', { id });
    } catch (err) {
      debugLogger.error('OPERATION', 'Failed to toggle todo completion', { 
        id, 
        error: err.message,
        originalCompleted,
        newCompleted,
        stack: err.stack 
      });
      
      debugLogger.debug('STATE', 'Reverting optimistic update', { id, revertTo: originalCompleted });
      
      // Revert optimistic update on error - restore to original state
      setTodos(prevTodos =>
        prevTodos.map(t =>
          t.id === id ? { ...t, completed: originalCompleted } : t
        )
      );
      
      operationDebugger.logFailure('toggleComplete', err, { id, originalCompleted, newCompleted });
      performanceMonitor.failOperation(operationId, err);
      
      handleOperationError(err, 'TOGGLE_COMPLETE', { id, originalCompleted, newCompleted });
      debugLogger.debug('OPERATION', 'Error handled for toggle operation', { id });
    } finally {
      debugLogger.debug('OPERATION', 'Clearing loading state for toggle operation', { id });
      setOperationLoadingWithTimeout('toggling', false, id);
      debugLogger.debug('OPERATION', 'Toggle operation cleanup completed', { id });
    }
  };

  const handleDeleteTodo = async id => {
    prodLogger.log('🗑️ handleDeleteTodo called with id:', id);
    prodLogger.log('📊 Current operation loading state:', operationLoading);
    prodLogger.log('🔒 Is delete operation blocked for id', id, ':', isOperationLoading('deleting', id));
    
    // Prevent multiple simultaneous delete operations on the same todo using enhanced safeguards
    if (isOperationLoading('deleting', id) || !canProceedWithOperation('deleting')) {
      prodLogger.log('⚠️ Delete operation blocked - already in progress for id or concurrency limit reached:', id);
      return;
    }

    // Store the todo for potential rollback
    const todoToDelete = todos.find(t => t.id === id);
    if (!todoToDelete) {
      prodLogger.log('❌ Todo not found for deletion, id:', id);
      return;
    }

    prodLogger.log('📝 Todo found for deletion:', { id: todoToDelete.id, text: todoToDelete.text });

    // Store the original index for proper rollback
    const originalIndex = todos.findIndex(t => t.id === id);
    prodLogger.log('📍 Original index for rollback:', originalIndex);

    try {
      console.log('🚀 Starting delete operation for id:', id);
      setOperationLoadingWithTimeout('deleting', true, id, 10000);
      console.log('✅ Loading state set to true for delete operation');

      // Optimistic update - remove from UI immediately
      console.log('⚡ Applying optimistic update - removing from UI');
      setTodos(prevTodos => prevTodos.filter(t => t.id !== id));

      // API call with retry mechanism and proper response handling
      console.log('🌐 Making API call to delete todo');
      const response = await retryMechanisms.retryDelete(async () => {
        return await deleteTodo(id);
      });
      console.log('✅ API call completed, response:', response);
      
      // Verify the deletion was successful
      // The backend returns { success: true, data: deletedTodo } or similar
      if (response && (response.success !== false)) {
        // Clear any previous errors on success
        clearError();
        console.log('✅ Delete operation completed successfully');
      } else {
        // If response indicates failure, treat as error
        console.log('❌ Delete operation failed based on response:', response);
        throw new Error(response?.message || 'Delete operation failed');
      }
    } catch (err) {
      console.error('❌ Failed to delete todo:', err);
      console.log('🔄 Reverting optimistic update - restoring todo at index:', originalIndex);
      
      // Revert optimistic update on error - restore in original position
      setTodos(prevTodos => {
        const newTodos = [...prevTodos];
        newTodos.splice(originalIndex, 0, todoToDelete);
        return newTodos;
      });
      
      handleOperationError(err, 'DELETE_TODO', { id, todoText: todoToDelete.text });
      console.log('❌ Error handled for delete operation');
    } finally {
      console.log('🏁 Clearing loading state for delete operation');
      setOperationLoadingWithTimeout('deleting', false, id);
      console.log('✅ Delete operation cleanup completed');
    }
  };

  const handleUpdateTodo = async (id, newText) => {
    // Prevent multiple simultaneous update operations on the same todo using enhanced safeguards
    if (isOperationLoading('updating', id) || !canProceedWithOperation('updating')) {
      console.log('⚠️ Update operation blocked - already in progress for id or concurrency limit reached:', id);
      return;
    }

    // Store the original todo for potential rollback
    const originalTodo = todos.find(t => t.id === id);
    if (!originalTodo) return;

    try {
      setOperationLoadingWithTimeout('updating', true, id);

      // Optimistic update
      setTodos(prevTodos =>
        prevTodos.map(t => (t.id === id ? { ...t, text: newText } : t))
      );

      // API call with retry mechanism and proper response handling
      const response = await retryMechanisms.retryUpdate(async () => {
        return await updateTodo(id, { text: newText });
      });
      
      // Update with the actual data from the server to ensure consistency
      if (response && response.data) {
        setTodos(prevTodos =>
          prevTodos.map(t => (t.id === id ? response.data : t))
        );
      }
      
      // Clear any previous errors on success
      clearError();
    } catch (err) {
      console.error('Failed to update todo:', err);
      
      // Revert optimistic update on error
      setTodos(prevTodos =>
        prevTodos.map(t => (t.id === id ? originalTodo : t))
      );
      
      handleOperationError(err, 'UPDATE_TODO', { id, originalText: originalTodo.text, newText });
    } finally {
      setOperationLoadingWithTimeout('updating', false, id);
    }
  };

  const handleReorderTodos = async (reorderedTodos) => {
    // Prevent multiple simultaneous reorder operations using enhanced safeguards
    if (isOperationLoading('reordering') || !canProceedWithOperation('reordering')) {
      console.log('⚠️ Reorder operation blocked - already in progress or concurrency limit reached');
      return;
    }

    // Store the original order for potential rollback
    const originalTodos = [...todos];

    try {
      setOperationLoadingWithTimeout('reordering', true);

      // Optimistic update - update local state immediately
      setTodos(reorderedTodos);

      // Prepare the order data for API call
      const todoOrders = reorderedTodos.map((todo, index) => ({
        id: todo.id,
        order: index
      }));

      // API call to persist the new order with retry mechanism
      await retryMechanisms.retryReorder(async () => {
        return await reorderTodos(todoOrders);
      });
      
      // Clear any previous errors
      clearError();
    } catch (err) {
      console.error('Failed to reorder todos:', err);
      // Revert optimistic update on error
      setTodos(originalTodos);
      
      handleOperationError(err, 'REORDER_TODOS', { todoCount: reorderedTodos.length });
    } finally {
      setOperationLoadingWithTimeout('reordering', false);
    }
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <AddTodo onAddTodo={addTodo} loading={operationLoading.creating} />

      {(error || errorState.error) && (
        <ErrorDisplay
          error={errorState.error || error}
          onDismiss={clearError}
          onRetry={errorState.canRetry ? retryLastOperation : null}
          operation={errorState.operation}
          variant="auto"
          showDetails={process.env.NODE_ENV === 'development'}
          autoRetryAttempts={errorState.retryAttempts}
          maxAutoRetries={3}
          className="mb-4"
        />
      )}

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              placeholder="Search your todos..."
            />
          </div>
          <div className="sm:w-48">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              categories={availableCategories}
            />
          </div>
        </div>
        
        {/* Active filters display */}
        {(searchQuery || selectedCategory) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {(loading || isSearching) ? (
          <div className="text-center py-8">
            <LoadingSpinner 
              size="lg" 
              text={isSearching ? 'Searching tasks...' : 'Loading tasks...'} 
            />
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-200">
            {searchQuery || selectedCategory ? (
              <div>
                <p>No todos found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                  }}
                  className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              'No tasks yet. Add one above to get started!'
            )}
          </div>
        ) : (
          <>
            {activeTodos.length > 0 && (
              <DragDropList
                todos={activeTodos}
                onToggleComplete={toggleComplete}
                onDeleteTodo={handleDeleteTodo}
                onUpdateTodo={handleUpdateTodo}
                onReorderTodos={handleReorderTodos}
                loadingStates={{
                  toggling: operationLoading.toggling,
                  deleting: operationLoading.deleting,
                  updating: operationLoading.updating,
                  reordering: operationLoading.reordering
                }}
              />
            )}
          </>
        )}
      </div>

      {todos.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center transition-colors duration-200">
          {activeTodos.length} of {todos.length} tasks remaining
          {(searchQuery || selectedCategory) && (
            <span className="block text-xs mt-1">
              (filtered results)
            </span>
          )}
        </div>
      )}

      {/* Completed Section */}
      <div className="mt-8">
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium">
            Completed ({completedTodos.length})
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${showCompleted ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showCompleted && (
          <div className="mt-3 space-y-2">
            {completedTodos.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No completed tasks
              </div>
            ) : (
              completedTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={toggleComplete}
                  onDeleteTodo={handleDeleteTodo}
                  onUpdateTodo={handleUpdateTodo}
                  loadingStates={{
                    toggling: operationLoading.toggling.has(todo.id),
                    deleting: operationLoading.deleting.has(todo.id),
                    updating: operationLoading.updating.has(todo.id)
                  }}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Debug Panel - only shows in development */}
      {import.meta.env.DEV && false && <DebugPanel />}
    </div>
  );
};

export default TodoList;
