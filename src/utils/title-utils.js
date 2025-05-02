/**
 * Utility functions for managing page titles
 */

/**
 * Sets the page title with the Memorix prefix
 * @param {string} pageTitle - The specific page title
 */
export const setPageTitle = (pageTitle) => {
  if (pageTitle) {
    document.title = `${pageTitle} | Memorix`;
  } else {
    document.title = 'Memorix - Your Smart Study Companion';
  }
};

/**
 * Page title constants for common pages
 */
export const PAGE_TITLES = {
  DASHBOARD: 'Dashboard',
  FLASHCARDS: 'Flashcards',
  PROGRESS: 'Progress',
  SETTINGS: 'Settings',
  STUDY: 'Study Mode',
  QUIZ: 'Quiz',
  CREATE: 'Create Flashcards',
  EDIT: 'Edit Flashcards',
  LOGIN: 'Login',
  SIGNUP: 'Sign Up',
}; 