import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-violet-600" />
      ) : (
        <Sun size={20} className="text-amber-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
