import { useState } from 'react';

const TodoItem = ({ todo, onToggleComplete, onDeleteTodo, onUpdateTodo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

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

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggleComplete(todo.id)}
        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
      />

      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleSave}
          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className={`flex-1 cursor-pointer ${
            todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}
        >
          {todo.text}
        </span>
      )}

      <button
        onClick={() => onDeleteTodo(todo.id)}
        className="px-3 py-1 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded transition-colors"
        title="Delete task"
      >
        Delete
      </button>
    </div>
  );
};

export default TodoItem;
