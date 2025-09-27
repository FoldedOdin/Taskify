import React, { useState } from 'react';
import LoadingButton from './LoadingButton';
import LoadingSpinner from './LoadingSpinner';
import { prodLogger } from '../utils/productionLogger';

const TodoItem = ({ todo, onToggleComplete, onDeleteTodo, onUpdateTodo, loadingStates = {} }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  // Debug: Log component props and event handlers (development only)
  React.useEffect(() => {
    prodLogger.log('🔧 TodoItem rendered for todo:', todo.id);
    prodLogger.log('📊 Props verification:');
    prodLogger.log('  - onToggleComplete:', typeof onToggleComplete === 'function' ? '✅ function' : '❌ not a function');
    prodLogger.log('  - onDeleteTodo:', typeof onDeleteTodo === 'function' ? '✅ function' : '❌ not a function');
    prodLogger.log('  - loadingStates:', loadingStates);
    
    if (typeof onToggleComplete !== 'function') {
      prodLogger.error('❌ onToggleComplete prop is not a function for todo:', todo.id);
    }
    if (typeof onDeleteTodo !== 'function') {
      prodLogger.error('❌ onDeleteTodo prop is not a function for todo:', todo.id);
    }
  }, [todo.id, onToggleComplete, onDeleteTodo, loadingStates]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditText(todo.text);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdateTodo(todo.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const now = new Date();
  const dueAt = todo.dueDate ? new Date(todo.dueDate) : null;
  const formatDateDMY = (d) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  const formatDateTimeDMY = (d) => `${formatDateDMY(d)} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const isOverdue = dueAt ? dueAt < now && !todo.completed : false;
  const isDueSoon = dueAt ? dueAt >= now && (dueAt - now) / (1000 * 60 * 60) <= 24 && !todo.completed : false;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 ${
      isOverdue
        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
        : isDueSoon
        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}
      title={`Created: ${formatDateTimeDMY(new Date(todo.createdAt))}${
        todo.updatedAt && todo.completed ? `\nCompleted: ${formatDateTimeDMY(new Date(todo.updatedAt))}` : ''
      }`}
    >
      <div className="relative">
        {loadingStates.toggling ? (
          <LoadingSpinner size="sm" className="w-5 h-5" />
        ) : (
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => {
              // Stop event propagation to prevent conflicts with drag-and-drop
              e.stopPropagation();
              
              prodLogger.log('☑️ Checkbox onChange event triggered for todo:', todo.id);
              prodLogger.log('📊 Event details:', { 
                checked: e.target.checked, 
                disabled: loadingStates.toggling,
                onToggleComplete: typeof onToggleComplete === 'function' ? 'available' : 'missing'
              });
              
              // Prevent action if already loading
              if (loadingStates.toggling) {
                prodLogger.log('⚠️ Checkbox click ignored - toggle operation in progress');
                return;
              }
              
              if (typeof onToggleComplete === 'function') {
                prodLogger.log('🚀 Calling onToggleComplete for todo:', todo.id);
                onToggleComplete(todo.id);
              } else {
                prodLogger.error('❌ onToggleComplete is not available!');
              }
            }}
            disabled={loadingStates.toggling}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer disabled:cursor-not-allowed"
          />
        )}
      </div>

      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleSave}
          disabled={loadingStates.updating}
          className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 disabled:opacity-50"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={loadingStates.updating ? undefined : handleDoubleClick}
          className={`flex-1 transition-colors duration-200 ${
            loadingStates.updating 
              ? 'cursor-wait opacity-75' 
              : 'cursor-pointer'
          } ${
            todo.completed 
              ? 'text-gray-500 dark:text-gray-400 line-through' 
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {loadingStates.updating && (
            <LoadingSpinner size="sm" className="inline mr-2" />
          )}
          {todo.text}
        </span>
      )}

      {dueAt && (
        <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap" title={`Due: ${formatDateTimeDMY(dueAt)}`}>
          Due: {formatDateDMY(dueAt)} {dueAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      <LoadingButton
        onClick={(e) => {
          // Stop event propagation to prevent conflicts with drag-and-drop
          e.stopPropagation();
          
          prodLogger.log('🗑️ Delete button onClick event triggered for todo:', todo.id);
          prodLogger.log('📊 Event details:', { 
            disabled: loadingStates.deleting,
            onDeleteTodo: typeof onDeleteTodo === 'function' ? 'available' : 'missing'
          });
          
          // Prevent action if already loading
          if (loadingStates.deleting) {
            prodLogger.log('⚠️ Delete button click ignored - delete operation in progress');
            return;
          }
          
          if (typeof onDeleteTodo === 'function') {
            prodLogger.log('🚀 Calling onDeleteTodo for todo:', todo.id);
            onDeleteTodo(todo.id);
          } else {
            prodLogger.error('❌ onDeleteTodo is not available!');
          }
        }}
        loading={loadingStates.deleting}
        loadingText="Deleting..."
        variant="danger"
        size="sm"
        disabled={loadingStates.deleting}
        title="Delete task"
      >
        Delete
      </LoadingButton>
    </div>
  );
};

export default TodoItem;
