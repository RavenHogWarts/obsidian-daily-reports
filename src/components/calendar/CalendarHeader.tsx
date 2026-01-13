import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarMode } from './types';

interface CalendarHeaderProps {
  viewDate: Date;
  mode: CalendarMode;
  onPrev: () => void;
  onNext: () => void;
  onChangeMode: (mode: CalendarMode) => void;
}

export const CalendarHeader = ({
  viewDate,
  mode,
  onPrev,
  onNext,
  onChangeMode,
}: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4 px-1">
      <button
        onClick={onPrev}
        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1">
        {/* Year Button */}
        <button
          onClick={() => onChangeMode(mode === 'year-picker' ? 'calendar' : 'year-picker')}
          className={`
            px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200
            ${mode === 'year-picker'
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 ring-2 ring-violet-200 dark:ring-violet-800'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}
          `}
          title="Switch Year"
        >
          {viewDate.getFullYear()}
        </button>

        {/* Month Button (Hidden in Year Picker) */}
        {mode !== 'year-picker' && (
          <button
            onClick={() => onChangeMode(mode === 'month-picker' ? 'calendar' : 'month-picker')}
            className={`
              px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200
              ${mode === 'month-picker'
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 ring-2 ring-violet-200 dark:ring-violet-800'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}
            `}
            title="Switch Month"
          >
            {viewDate.getMonth() + 1} 月
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
