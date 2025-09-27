import React, { useState, useEffect } from 'react';
import { getAllTags, addCustomTag } from '../utils/tagsManager';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const clampToLocalInput = (date) => {
  const d = new Date(date);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  return local;
};

const toISO = (year, monthIndex, day, hour12, minute, period) => {
  let h = hour12 % 12;
  if (period === 'PM') h += 12;
  const dt = new Date(year, monthIndex, day, h, minute, 0, 0);
  return dt.toISOString();
};

const isPast = (year, monthIndex, day, hour12, minute, period) => {
  const iso = toISO(year, monthIndex, day, hour12, minute, period);
  const dt = new Date(iso);
  return dt.getTime() < Date.now();
};

const generateMonthGrid = (year, monthIndex) => {
  const first = new Date(year, monthIndex, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();

  const cells = [];
  // Leading days
  for (let i = 0; i < startDay; i++) {
    cells.push({
      day: prevMonthDays - startDay + 1 + i,
      current: false,
    });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  // Trailing to complete 6 rows * 7 cols = 42 cells
  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({ day: cells.length - (startDay + daysInMonth) + 1, current: false });
  }
  return cells;
};

const DueDateModal = ({ isOpen, initialValue, onCancel, onSave, initialTags = [] }) => {
  const now = new Date();
  const init = initialValue ? new Date(initialValue) : now;

  const [viewYear, setViewYear] = useState(init.getFullYear());
  const [viewMonth, setViewMonth] = useState(init.getMonth());
  const [selectedDay, setSelectedDay] = useState(init.getDate());
  const [hour, setHour] = useState(() => {
    const h = init.getHours();
    const h12 = h % 12 || 12;
    return h12.toString().padStart(2, '0');
  });
  const [minute, setMinute] = useState(init.getMinutes().toString().padStart(2, '0'));
  const [period, setPeriod] = useState(init.getHours() >= 12 ? 'PM' : 'AM');
  const [error, setError] = useState('');
  const [selectedTags, setSelectedTags] = useState(initialTags);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);

  // Load available tags (including custom ones)
  useEffect(() => {
    setAvailableTags(getAllTags());
  }, []);

  useEffect(() => {
    if (isOpen) {
      const base = initialValue ? new Date(initialValue) : new Date();
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
      setSelectedDay(base.getDate());
      const h = base.getHours();
      const h12 = h % 12 || 12;
      setHour(h12.toString().padStart(2, '0'));
      setMinute(base.getMinutes().toString().padStart(2, '0'));
      setPeriod(h >= 12 ? 'PM' : 'AM');
      setError('');
      setSelectedTags(initialTags);
      setNewTag('');
    }
  }, [isOpen, initialValue, initialTags]);

  const goPrevMonth = () => {
    const m = viewMonth - 1;
    if (m < 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(m);
    }
    setError('');
  };
  const goNextMonth = () => {
    const m = viewMonth + 1;
    if (m > 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(m);
    }
    setError('');
  };

  const addTag = (tag) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddNewTag = () => {
    if (newTag.trim()) {
      const trimmedTag = newTag.trim();
      addTag(trimmedTag);
      
      // Add to global custom tags and update available tags
      addCustomTag(trimmedTag);
      setAvailableTags(getAllTags());
      
      console.log('✅ Added custom tag:', trimmedTag, 'Available tags:', getAllTags());
      
      setNewTag('');
    }
  };

  const save = () => {
    // Compose ISO and validate not in past
    const iso = toISO(parseInt(viewYear), parseInt(viewMonth), parseInt(selectedDay), parseInt(hour, 10), parseInt(minute, 10), period);
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) {
      setError('Invalid date/time');
      return;
    }
    if (dt < new Date()) {
      setError('Invalid date: selected time is in the past');
      return;
    }
    onSave(iso, selectedTags);
  };

  if (!isOpen) return null;

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString(undefined, { month: 'long' });
  const cells = generateMonthGrid(viewYear, viewMonth);
  const today = new Date();
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div
      className="fixed inset-0 bg-black/30 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] transform transition-all duration-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Due Date & Time</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close due date modal">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Calendar */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <button onClick={goPrevMonth} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Previous month">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                </button>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{monthName} {viewYear}</div>
                <button onClick={goNextMonth} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Next month">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-gray-500 dark:text-gray-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 mt-1">
                {cells.map((c, i) => {
                  const isSel = c.current && c.day === selectedDay;
                  const isDim = !c.current;
                  const isPastDay = c.current && isCurrentMonth && c.day < today.getDate();
                  const disabled = !c.current || isPastDay;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (disabled) return;
                        setSelectedDay(c.day);
                        // Clear past error when choosing a valid day
                        setError('');
                      }}
                      className={`py-2 text-sm rounded-md transition-colors ${
                        isSel
                          ? 'bg-blue-600 text-white'
                          : disabled
                          ? 'text-gray-400 dark:text-gray-600'
                          : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      disabled={disabled}
                    >
                      {c.day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time picker and Tags */}
            <div className="p-4 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 space-y-4">
              {/* Time Section */}
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Time</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    value={hour}
                    onChange={(e) => setHour(String(Math.min(12, Math.max(1, parseInt(e.target.value || '0', 10)))).padStart(2, '0'))}
                    className="w-16 px-2 py-2 text-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={1}
                    max={12}
                  />
                  <span className="text-gray-500 dark:text-gray-400">:</span>
                  <input
                    type="number"
                    value={minute}
                    onChange={(e) => setMinute(String(Math.min(59, Math.max(0, parseInt(e.target.value || '0', 10)))).padStart(2, '0'))}
                    className="w-16 px-2 py-2 text-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={0}
                    max={59}
                  />
                  <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 relative z-10">
                    <button
                      type="button"
                      onClick={() => setPeriod('AM')}
                      className={`w-12 px-2 py-2 text-sm text-center transition-colors ${period === 'AM' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriod('PM')}
                      className={`w-12 px-2 py-2 text-sm text-center transition-colors ${period === 'PM' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    >
                      PM
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  Selected: {String(selectedDay).padStart(2, '0')}/
                  {String(viewMonth + 1).padStart(2, '0')}/{viewYear} {hour}:{minute} {period}
                </div>
                {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
              </div>

              {/* Tags Section */}
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Tags</div>
                
                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selectedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Available Tags */}
                <div className="mb-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available Tags:</div>
                  <div className="flex flex-wrap gap-1">
                    {availableTags.filter(tag => !selectedTags.includes(tag)).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-2 py-1 text-xs rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Tag Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNewTag()}
                    placeholder="Add custom tag..."
                    className="flex-1 px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddNewTag}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onCancel} className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
          <button onClick={save} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white">Save</button>
        </div>
      </div>
    </div>
  );
};

export default DueDateModal;
