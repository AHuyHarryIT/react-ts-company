import { AppDispatch } from '@stores/index';
import { toggleTheme } from '@stores/themeSlice';
import React from 'react';
import { FaRegMoon, FaSun } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export const ThemeToggleButton: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="hover:text-dark-900 relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      <FaSun className="hidden text-xl dark:block" />
      <FaRegMoon className="text-xl dark:hidden" />
    </button>
  );
};
