import { useState } from 'react';
import DueDateModal from './DueDateModal';

const AddTodo = ({ onAddTodo }) => {
  const [text, setText] = useState('');
  const [dueDateTime, setDueDateTime] = useState('');
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [submitAfterDue, setSubmitAfterDue] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!dueDateTime) {
      setIsDueModalOpen(true);
      setSubmitAfterDue(true);
      return;
    }
    const dueAt = new Date(dueDateTime).toISOString();
    onAddTodo(text.trim(), dueAt);
    setText('');
    setDueDateTime('');
    setSubmitAfterDue(false);
  };

  const openDueModal = () => setIsDueModalOpen(true);
  const closeDueModal = () => setIsDueModalOpen(false);
  const saveDueModal = (iso) => {
    setDueDateTime(iso);
    setIsDueModalOpen(false);
    // If user clicked Add Task and we were waiting for due date, auto-submit now
    if (submitAfterDue && text.trim()) {
      const dueAt = new Date(iso).toISOString();
      onAddTodo(text.trim(), dueAt);
      setText('');
      setDueDateTime('');
      setSubmitAfterDue(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
        >
          Add Task
        </button>
      </div>
      <DueDateModal
        isOpen={isDueModalOpen}
        initialValue={dueDateTime}
        onCancel={closeDueModal}
        onSave={saveDueModal}
      />
    </form>
  );
};

export default AddTodo;
