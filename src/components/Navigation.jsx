import React, { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const Navigation = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a saved preference or default to system preference
    const saved = localStorage.getItem('darkMode');
    console.log('Initial load - saved preference:', saved);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      console.log('Using saved preference:', parsed);
      return parsed;
    }
    const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('Using system preference:', systemPref);
    return systemPref;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  useEffect(() => {
    console.log('Dark mode changed to:', isDarkMode);
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      console.log('Added dark class to document');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Removed dark class from document');
    }
    
    // Log current classes on document
    console.log('Document classes:', document.documentElement.className);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    console.log('Toggle clicked! Current mode:', isDarkMode);
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      console.log('Switching to:', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // Add keyboard shortcut for dark mode toggle (Ctrl/Cmd + D)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        toggleDarkMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleSignUp = () => {
    setIsSignupModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Taskify Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                className="h-8 w-8 mr-3" 
                src="/Taskify_icon.svg" 
                alt="Taskify Logo"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                Taskify
              </h1>
            </div>
          </div>

          {/* Right side - Login, SignUp buttons and Dark Mode toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogin}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Login
            </button>
            <button
              onClick={handleSignUp}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Sign Up
            </button>
            
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              title={isDarkMode ? 'Switch to light mode (Ctrl+D)' : 'Switch to dark mode (Ctrl+D)'}
              aria-label={isDarkMode ? 'Switch to light mode (Ctrl+D)' : 'Switch to dark mode (Ctrl+D)'}
            >
              <div className="relative">
                {isDarkMode ? (
                  // Sun icon for light mode
                  <svg 
                    className="w-5 h-5 transition-transform duration-200 hover:rotate-180" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  // Moon icon for dark mode
                  <svg 
                    className="w-5 h-5 transition-transform duration-200 hover:rotate-12" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <SignupModal isOpen={isSignupModalOpen} onClose={closeSignupModal} />
    </nav>
  );
};

export default Navigation;
