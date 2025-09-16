import { useState } from 'react';
import AddTodo from './AddTodo';
import TodoItem from './TodoItem';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [showCompleted, setShowCompleted] = useState(false);

  const addTodo = (text, dueAt) => {
    const newTodo = {
      id: nextId,
      text,
      completed: false,
      createdAt: new Date(),
      dueAt: dueAt ? new Date(dueAt) : null,
    };
    setTodos([...todos, newTodo]);
    setNextId(nextId + 1);
  };

  const toggleComplete = id => {
    setTodos(
      todos.map(todo =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              completedAt: !todo.completed ? new Date() : null,
            }
          : todo
      )
    );
  };

  const deleteTodo = id => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const updateTodo = (id, newText) => {
    setTodos(
      todos.map(todo => (todo.id === id ? { ...todo, text: newText } : todo))
    );
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <AddTodo onAddTodo={addTodo} />

      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-200">
            No tasks yet. Add one above to get started!
          </div>
        ) : (
          activeTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={toggleComplete}
              onDeleteTodo={deleteTodo}
              onUpdateTodo={updateTodo}
            />
          ))
        )}
      </div>

      {todos.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center transition-colors duration-200">
          {activeTodos.length} of {todos.length} tasks
          remaining
        </div>
      )}

      {/* Completed Section */}
      <div className="mt-8">
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium">Completed ({completedTodos.length})</span>
          <svg
            className={`w-5 h-5 transition-transform ${showCompleted ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCompleted && (
          <div className="mt-3 space-y-2">
            {completedTodos.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">No completed tasks</div>
            ) : (
              completedTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={toggleComplete}
                  onDeleteTodo={deleteTodo}
                  onUpdateTodo={updateTodo}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
