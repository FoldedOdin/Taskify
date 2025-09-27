import { useState } from 'react';
import DueDateModal from './DueDateModal';
import LoadingButton from './LoadingButton';

const AddTodo = ({ onAddTodo, loading = false }) => {
  const [text, setText] = useState('');
  const [dueDateTime, setDueDateTime] = useState('');
  const [tags, setTags] = useState([]);
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
    onAddTodo(text.trim(), dueAt, tags);
    setText('');
    setDueDateTime('');
    setTags([]);
    setSubmitAfterDue(false);
  };

  const openDueModal = () => setIsDueModalOpen(true);
  const closeDueModal = () => setIsDueModalOpen(false);
  const saveDueModal = (iso, selectedTags = []) => {
    setDueDateTime(iso);
    setTags(selectedTags);
    setIsDueModalOpen(false);
    // If user clicked Add Task and we were waiting for due date, auto-submit now
    if (submitAfterDue && text.trim()) {
      const dueAt = new Date(iso).toISOString();
      onAddTodo(text.trim(), dueAt, selectedTags);
      setText('');
      setDueDateTime('');
      setTags([]);
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
        <LoadingButton
          type="submit"
          loading={loading}
          loadingText="Adding..."
          disabled={!text.trim() || loading}
        >
          Add Task
        </LoadingButton>
      </div>
      <DueDateModal
        isOpen={isDueModalOpen}
        initialValue={dueDateTime}
        initialTags={tags}
        onCancel={closeDueModal}
        onSave={saveDueModal}
      />
    </form>
  );
};

export default AddTodo;
