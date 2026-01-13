import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white hover:opacity-80 transition-opacity">
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-violet-600 dark:text-violet-400">
             <path d="M50 5L15 25V75L50 95L85 75V25L50 5Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="4"/>
             <path d="M50 25L25 40V65L50 80L75 65V40L50 25Z" fill="currentColor"/>
          </svg>
          <span className="hidden sm:inline">Obsidian Reports</span>
          <span className="sm:hidden">Reports</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <nav className="flex gap-4 md:gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Home</Link>
            <Link to="/daily/latest" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Latest Report</Link>
          </nav>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
