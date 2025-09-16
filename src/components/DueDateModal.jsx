import React, { useState, useEffect } from 'react';

const DueDateModal = ({ isOpen, initialValue, onCancel, onSave }) => {
  const [dateTime, setDateTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialValue) {
        try {
          const iso = typeof initialValue === 'string' ? initialValue : initialValue.toISOString();
          const d = new Date(iso);
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setDateTime(local);
        } catch {
          setDateTime('');
        }
      } else {
        setDateTime('');
      }
      setError('');
    }
  }, [isOpen, initialValue]);

  const validate = () => {
    if (!dateTime) {
      setError('Please select a date and time');
      return false;
    }
    const ms = Date.parse(dateTime);
    if (Number.isNaN(ms)) {
      setError('Invalid date/time');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    const iso = new Date(dateTime).toISOString();
    onSave(iso);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm transform transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Due Date & Time</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close due date modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => {
              setDateTime(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="p-4 pt-0 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DueDateModal;
