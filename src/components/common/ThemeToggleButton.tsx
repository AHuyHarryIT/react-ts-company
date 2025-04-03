import { Badge } from 'antd';
import React from 'react';

import { toggleTheme } from '@stores/uiStore';

import { FaRegMoon, FaSun } from 'react-icons/fa';

export const ThemeToggleButton: React.FC = () => {
  return (
    <>
      <Badge count="Beta" color="blue" offset={[-40, 0]} size="small">
        <button
          onClick={toggleTheme}
          className="hover:text-dark-900 relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <FaSun className="hidden text-xl dark:block" />
          <FaRegMoon className="text-xl dark:hidden" />
        </button>
      </Badge>
    </>
  );
};
