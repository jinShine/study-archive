'use client';

import { useThemeStore } from './ThemeProvider';

export default function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <div className="flex gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors duration-200">
      <button 
        onClick={() => setTheme('light')}
        className={`px-4 py-2 rounded transition-all ${theme === 'light' ? 'bg-white text-black shadow' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
      >
        Light
      </button>
      <button 
        onClick={() => setTheme('dark')}
        className={`px-4 py-2 rounded transition-all ${theme === 'dark' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
      >
        Dark
      </button>
      <button 
        onClick={() => setTheme('system')}
        className={`px-4 py-2 rounded transition-all ${theme === 'system' ? 'bg-blue-500 text-white shadow' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
      >
        System
      </button>
    </div>
  );
}
