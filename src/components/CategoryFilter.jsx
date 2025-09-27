import React, { useState } from 'react';
import { getCategoryColor } from '../utils/tagsManager';

const CategoryFilter = ({ selectedCategory, onCategoryChange, categories }) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultCategories = ['All', 'Work', 'Personal', 'Shopping', 'Health'];
  const availableCategories = categories || defaultCategories;

  const handleCategorySelect = (category) => {
    const filterValue = category === 'All' ? '' : category;
    onCategoryChange(filterValue);
    setIsOpen(false);
  };

  const displayCategory = selectedCategory || 'All';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <span className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          {displayCategory}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          <div className="py-1">
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  displayCategory === category
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="flex items-center">
                  {category === 'All' ? (
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  ) : (
                    <div className={`w-3 h-3 mr-3 rounded-full ${getCategoryColor(category)}`} />
                  )}
                  {category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Note: getCategoryColor is now imported from tagsManager

export default CategoryFilter;