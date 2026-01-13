import { useMemo } from 'react';
import { formatDate, formatWeekString, getISOWeek, getISOYear } from '../../utils/date';
import type { WeekRow } from './types';

interface CalendarGridProps {
  viewDate: Date;
  availableDates: Set<string>;
  availableWeeks: Set<string>;
  currentDate?: string;
  currentWeek?: string;
  onDateSelect: (dateString: string) => void;
  onWeekSelect: (weekString: string) => void;
  onWeekHeaderClick: () => void;
}

export const CalendarGrid = ({
  viewDate,
  availableDates,
  availableWeeks,
  currentDate,
  currentWeek,
  onDateSelect,
  onWeekSelect,
  onWeekHeaderClick,
}: CalendarGridProps) => {
  const calendarRows = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay() || 7; // ISO: 1=Mon, 7=Sun
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - (startDayOfWeek - 1));

    const lastDayOfMonth = new Date(year, month + 1, 0);
    const endDayOfWeek = lastDayOfMonth.getDay() || 7;
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(lastDayOfMonth.getDate() + (7 - endDayOfWeek));

    const rows: WeekRow[] = [];
    let current = new Date(startDate);
    // Safety break to prevent infinite loops
    let count = 0;

    while (current <= endDate && count < 100) {
      const daysInWeek = [];
      const weekYear = getISOYear(current);
      const weekNumber = getISOWeek(current);
      const weekString = formatWeekString(weekYear, weekNumber);

      for (let i = 0; i < 7; i++) {
        const dateString = formatDate(current);
        daysInWeek.push({
          date: current.getDate(),
          dateString,
          isCurrentMonth: current.getMonth() === month,
          isAvailable: availableDates.has(dateString),
          isSelected: dateString === currentDate,
        });
        current.setDate(current.getDate() + 1);
      }

      rows.push({
        weekNumber,
        weekYear,
        weekString,
        isWeekAvailable: availableWeeks.has(weekString),
        isWeekSelected: weekString === currentWeek,
        days: daysInWeek,
      });
      count++;
    }
    return rows;
  }, [viewDate, availableDates, availableWeeks, currentDate, currentWeek]);

  return (
    <div className="select-none animate-in fade-in duration-300">
      {/* Week Header */}
      <div className="grid grid-cols-[3rem_repeat(7,1fr)] gap-y-2 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <div
          onClick={onWeekHeaderClick}
          className="text-center text-xs font-serif italic text-slate-400 cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 transition-colors rounded"
          title="Switch to Week Picker"
        >
          W
        </div>
        {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-400">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="space-y-1">
        {calendarRows.map((row) => (
          <div key={row.weekString} className="grid grid-cols-[3rem_repeat(7,1fr)] items-center group">
            {/* Week Number Button */}
            <button
              onClick={() => row.isWeekAvailable && onWeekSelect(row.weekString)}
              disabled={!row.isWeekAvailable}
              className={`
                text-xs font-serif italic text-center py-1.5 transition-all rounded
                ${
                  row.isWeekSelected
                    ? 'text-violet-600 font-bold dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                    : row.isWeekAvailable
                    ? 'text-slate-500 hover:text-violet-600 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
                    : 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                }
              `}
              title={row.isWeekAvailable ? `View Week ${row.weekNumber} Report` : 'No Weekly Report'}
            >
              w{row.weekNumber.toString().padStart(2, '0')}
            </button>

            {/* Day Buttons */}
            {row.days.map((day) => (
              <button
                key={day.dateString}
                onClick={() => day.isAvailable && onDateSelect(day.dateString)}
                disabled={!day.isAvailable}
                className={`
                  h-8 w-8 mx-auto flex items-center justify-center rounded-full text-sm transition-all duration-200 relative
                  ${
                    day.isSelected
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-none'
                      : day.isAvailable
                      ? 'hover:bg-violet-100 dark:hover:bg-violet-900/40 text-slate-700 dark:text-slate-200 cursor-pointer hover:scale-110'
                      : 'text-slate-300 dark:text-slate-600 cursor-default'
                  }
                  ${!day.isCurrentMonth && !day.isSelected ? 'opacity-30' : ''}
                `}
                title={day.isAvailable ? `View Daily Report: ${day.dateString}` : ''}
              >
                 {day.isAvailable && !day.isSelected && (
                     <span className="absolute bottom-1 w-1 h-1 bg-violet-400 rounded-full opacity-50"></span>
                 )}
                {day.date}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
