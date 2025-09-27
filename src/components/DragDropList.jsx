import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import SortableTodoItem from './SortableTodoItem';
import DragDropErrorBoundary from './DragDropErrorBoundary';
import TodoItem from './TodoItem';

const DragDropList = ({ 
  todos, 
  onToggleComplete, 
  onDeleteTodo, 
  onUpdateTodo, 
  onReorderTodos,
  loadingStates = {}
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = todos.findIndex((todo) => todo.id === active.id);
    const newIndex = todos.findIndex((todo) => todo.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedTodos = arrayMove(todos, oldIndex, newIndex);
      onReorderTodos(reorderedTodos);
    }
  };

  // Fallback content for error boundary - render todos without drag and drop
  const fallbackContent = todos.map((todo) => (
    <TodoItem
      key={todo.id}
      todo={todo}
      onToggleComplete={onToggleComplete}
      onDeleteTodo={onDeleteTodo}
      onUpdateTodo={onUpdateTodo}
      loadingStates={{
        toggling: loadingStates.toggling?.has(todo.id) || false,
        deleting: loadingStates.deleting?.has(todo.id) || false,
        updating: loadingStates.updating?.has(todo.id) || false
      }}
    />
  ));

  return (
    <DragDropErrorBoundary fallbackContent={fallbackContent}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={todos.map(todo => todo.id)} strategy={verticalListSortingStrategy}>
          <div className={`space-y-2 rounded-lg p-2 ${loadingStates.reordering ? 'opacity-75 pointer-events-none' : ''}`}>
            {todos.map((todo) => (
              <SortableTodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onDeleteTodo={onDeleteTodo}
                onUpdateTodo={onUpdateTodo}
                loadingStates={{
                  toggling: loadingStates.toggling?.has(todo.id) || false,
                  deleting: loadingStates.deleting?.has(todo.id) || false,
                  updating: loadingStates.updating?.has(todo.id) || false
                }}
              />
            ))}
            {loadingStates.reordering && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Reordering tasks...
                </div>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </DragDropErrorBoundary>
  );
};

export default DragDropList;