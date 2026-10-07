import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/** Single global dark/light control — render once in App. */
export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed bottom-5 left-5 z-[60] flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-xs font-bold shadow-lg transition cursor-pointer bg-white text-slate-800 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-amber-300 dark:border-slate-600 dark:hover:bg-slate-700"
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
};
