import { useState } from 'react';
import AddTodo from './AddTodo';
import TodoItem from './TodoItem';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [nextId, setNextId] = useState(1);

  const addTodo = text => {
    const newTodo = {
      id: nextId,
      text,
      completed: false,
      createdAt: new Date(),
    };
    setTodos([...todos, newTodo]);
    setNextId(nextId + 1);
  };

  const toggleComplete = id => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Taskify
      </h1>

      <AddTodo onAddTodo={addTodo} />

      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks yet. Add one above to get started!
          </div>
        ) : (
          todos.map(todo => (
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
        <div className="mt-6 text-sm text-gray-600 text-center">
          {todos.filter(todo => !todo.completed).length} of {todos.length} tasks
          remaining
        </div>
      )}
    </div>
  );
};

export default TodoList;
