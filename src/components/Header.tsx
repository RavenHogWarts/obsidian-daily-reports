import { Link, useParams } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { UnifiedCalendar } from './UnifiedCalendar';
import { useIndex } from '../hooks/useData';

const Header = () => {
  const params = useParams<{ date?: string; week?: string }>();
  const { data: indexData } = useIndex();

  // 获取当前日期或周
  const currentDate = params.date;
  const currentWeek = params.week;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white hover:opacity-80 transition-opacity">
          <img src="/obsidian.svg" alt="Obsidian Logo" width="24" height="24" className="text-violet-600 dark:text-violet-400" />
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
          <UnifiedCalendar
            availableDates={indexData.daily}
            availableWeeks={indexData.weekly}
            currentDate={currentDate}
            currentWeek={currentWeek}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
