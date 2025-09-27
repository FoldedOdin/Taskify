import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TodoItem from './TodoItem';

const SortableTodoItem = ({ todo, onToggleComplete, onDeleteTodo, onUpdateTodo, loadingStates = {} }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${
        isDragging 
          ? 'shadow-lg rotate-2 scale-105 z-50' 
          : 'shadow-sm'
      } transition-all duration-200 bg-white dark:bg-gray-800 rounded-lg`}
    >
      <div className="relative">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1 top-1/2 transform -translate-y-1/2 cursor-grab active:cursor-grabbing z-10 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Drag to reorder"
        >
          <svg
            className="w-4 h-4 text-gray-400 dark:text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zM7 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zM7 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zM13 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 2zM13 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zM13 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
          </svg>
        </div>
        
        {/* TodoItem with left padding to accommodate drag handle */}
        <div className="pl-6">
          <TodoItem
            todo={todo}
            onToggleComplete={onToggleComplete}
            onDeleteTodo={onDeleteTodo}
            onUpdateTodo={onUpdateTodo}
            loadingStates={loadingStates}
          />
        </div>
      </div>
    </div>
  );
};

export default SortableTodoItem;