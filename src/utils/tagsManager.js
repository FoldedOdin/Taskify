/**
 * Tags Management Utility
 * Manages custom tags and categories for the application
 */

const STORAGE_KEY = 'taskify_custom_tags';

// Default categories that are always available
export const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health'];

// Default predefined tags for quick selection
export const DEFAULT_TAGS = [
  'Work', 'Personal', 'Urgent', 'Important', 'Meeting', 
  'Project', 'Health', 'Shopping', 'Family', 'Study'
];

/**
 * Get all custom tags from localStorage
 * @returns {string[]} Array of custom tags
 */
export const getCustomTags = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load custom tags from localStorage:', error);
    return [];
  }
};

/**
 * Save custom tags to localStorage
 * @param {string[]} tags - Array of custom tags to save
 */
export const saveCustomTags = (tags) => {
  try {
    const uniqueTags = [...new Set(tags)]; // Remove duplicates
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueTags));
  } catch (error) {
    console.warn('Failed to save custom tags to localStorage:', error);
  }
};

/**
 * Add a new custom tag
 * @param {string} tag - Tag to add
 * @returns {string[]} Updated array of custom tags
 */
export const addCustomTag = (tag) => {
  if (!tag || typeof tag !== 'string') return getCustomTags();
  
  const trimmedTag = tag.trim();
  if (!trimmedTag) return getCustomTags();
  
  const currentTags = getCustomTags();
  
  // Don't add if it's already a default category or already exists
  if (DEFAULT_CATEGORIES.includes(trimmedTag) || currentTags.includes(trimmedTag)) {
    return currentTags;
  }
  
  const updatedTags = [...currentTags, trimmedTag];
  saveCustomTags(updatedTags);
  return updatedTags;
};

/**
 * Remove a custom tag
 * @param {string} tag - Tag to remove
 * @returns {string[]} Updated array of custom tags
 */
export const removeCustomTag = (tag) => {
  const currentTags = getCustomTags();
  const updatedTags = currentTags.filter(t => t !== tag);
  saveCustomTags(updatedTags);
  return updatedTags;
};

/**
 * Get all available categories (default + custom)
 * @returns {string[]} Array of all available categories
 */
export const getAllCategories = () => {
  const customTags = getCustomTags();
  return [...DEFAULT_CATEGORIES, ...customTags];
};

/**
 * Get all available tags for the tag picker (default + custom)
 * @returns {string[]} Array of all available tags
 */
export const getAllTags = () => {
  const customTags = getCustomTags();
  // Combine default tags with custom tags, removing duplicates
  const allTags = [...DEFAULT_TAGS, ...customTags];
  return [...new Set(allTags)];
};

/**
 * Check if a tag is a custom tag (not a default category/tag)
 * @param {string} tag - Tag to check
 * @returns {boolean} True if it's a custom tag
 */
export const isCustomTag = (tag) => {
  return !DEFAULT_CATEGORIES.includes(tag) && !DEFAULT_TAGS.includes(tag);
};

/**
 * Get category color for display
 * @param {string} category - Category name
 * @returns {string} CSS class for the category color
 */
export const getCategoryColor = (category) => {
  const colors = {
    Work: 'bg-blue-500',
    Personal: 'bg-green-500',
    Shopping: 'bg-purple-500',
    Health: 'bg-red-500',
  };
  
  // For custom tags, generate a color based on the tag name
  if (!colors[category]) {
    const customColors = [
      'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500'
    ];
    
    // Simple hash function to consistently assign colors
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % customColors.length;
    return customColors[colorIndex];
  }
  
  return colors[category];
};

/**
 * Extract tags from todos and add them as custom tags
 * @param {Object[]} todos - Array of todo objects
 */
export const extractAndSaveTagsFromTodos = (todos) => {
  if (!Array.isArray(todos)) return;
  
  const existingTags = new Set(getCustomTags());
  let hasNewTags = false;
  
  todos.forEach(todo => {
    if (todo.tags && Array.isArray(todo.tags)) {
      todo.tags.forEach(tag => {
        if (tag && typeof tag === 'string' && !DEFAULT_CATEGORIES.includes(tag) && !DEFAULT_TAGS.includes(tag)) {
          if (!existingTags.has(tag)) {
            existingTags.add(tag);
            hasNewTags = true;
          }
        }
      });
    }
  });
  
  if (hasNewTags) {
    saveCustomTags([...existingTags]);
  }
};