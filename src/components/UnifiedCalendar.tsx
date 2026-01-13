import { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDateFromWeek, parseWeekString } from '../utils/date';
import type {
  CalendarMode,
  UnifiedCalendarProps,
} from './calendar/types';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarGrid } from './calendar/CalendarGrid';
import { WeekPicker } from './calendar/WeekPicker';
import { MonthPicker } from './calendar/MonthPicker';
import { YearPicker } from './calendar/YearPicker';

export const UnifiedCalendar = ({
  availableDates,
  availableWeeks,
  currentDate,
  currentWeek,
}: UnifiedCalendarProps) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<CalendarMode>('calendar');

  // Initialize viewDate based on current selection or today
  const [viewDate, setViewDate] = useState(() => {
    if (currentDate) return new Date(currentDate);
    if (currentWeek) {
      const { year, week } = parseWeekString(currentWeek);
      return getDateFromWeek(year, week);
    }
    return new Date();
  });

  // State for Year Picker pagination
  const [yearPickerStart, setYearPickerStart] = useState(viewDate.getFullYear() - 4);

  // Memoize sets for O(1) lookups
  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);
  const availableWeekSet = useMemo(() => new Set(availableWeeks), [availableWeeks]);

  // Reset internal state when closing
  useEffect(() => {
    if (!isOpen) {
      // Optional: Reset to current view on close? 
      // Or keep last viewed state. Keeping usage as is for better UX.
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // --- Navigation Logic ---

  const handlePrev = () => {
    if (mode === 'year-picker') {
      setYearPickerStart((prev) => prev - 12);
      return;
    }

    const newDate = new Date(viewDate);
    if (mode === 'calendar') {
      newDate.setDate(1); // Safety: prevent month overflow
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      // week-picker or month-picker navigates by year
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setViewDate(newDate);
  };

  const handleNext = () => {
    if (mode === 'year-picker') {
      setYearPickerStart((prev) => prev + 12);
      return;
    }

    const newDate = new Date(viewDate);
    if (mode === 'calendar') {
      newDate.setDate(1); // Safety: prevent month overflow
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setViewDate(newDate);
  };

  // --- Mode Switching Handlers ---

  const handleYearSelect = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
    setMode('month-picker'); // Workflow: Year -> Month -> Calendar
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(1); // Safety: prevent month overflow
    newDate.setMonth(monthIndex);
    setViewDate(newDate);
    setMode('calendar');
  };

  const handleDateSelect = (dateString: string) => {
    setIsOpen(false);
    navigate(`/daily/${dateString}`);
  };

  const handleWeekSelect = (weekString: string) => {
      setIsOpen(false);
      navigate(`/weekly/${weekString}`);
  };

  const jumpToWeekMonth = (weekNumber: number) => {
      const year = viewDate.getFullYear();
      const targetDate = getDateFromWeek(year, weekNumber);
      targetDate.setDate(1); // Safety: view the month containing the week
      setViewDate(targetDate);
      setMode('calendar');
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setViewDate(today);
    setMode('calendar');
    setYearPickerStart(today.getFullYear() - 4);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
            p-2 rounded-lg transition-colors duration-200 
            ${isOpen 
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }
        `}
        aria-label="Toggle calendar"
        aria-expanded={isOpen}
      >
        <Calendar className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 min-w-[360px] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          
          <CalendarHeader 
            viewDate={viewDate}
            mode={mode}
            onPrev={handlePrev}
            onNext={handleNext}
            onChangeMode={setMode}
          />

          <div>
            {mode === 'calendar' && (
                <CalendarGrid 
                    viewDate={viewDate}
                    availableDates={availableDateSet}
                    availableWeeks={availableWeekSet}
                    currentDate={currentDate}
                    currentWeek={currentWeek}
                    onDateSelect={handleDateSelect}
                    onWeekSelect={handleWeekSelect}
                    onWeekHeaderClick={() => setMode('week-picker')}
                />
            )}

            {mode === 'week-picker' && (
                <WeekPicker 
                    year={viewDate.getFullYear()}
                    availableWeeks={availableWeekSet}
                    onWeekClick={jumpToWeekMonth}
                />
            )}

            {mode === 'month-picker' && (
                <MonthPicker 
                    currentMonth={viewDate.getMonth()}
                    onSelect={handleMonthSelect}
                />
            )}

            {mode === 'year-picker' && (
                <YearPicker 
                    startYear={yearPickerStart}
                    currentYear={viewDate.getFullYear()}
                    onSelect={handleYearSelect}
                />
            )}
          </div>
          
          <div className="pt-3 mt-1 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <button
              onClick={handleJumpToToday}
              className="px-4 py-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-full transition-colors"
            >
              回到今天
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
