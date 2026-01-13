import { useMemo } from 'react';
import { formatWeekString, getWeeksInYear } from '../../utils/date';

interface WeekPickerProps {
  year: number;
  availableWeeks: Set<string>;
  onWeekClick: (weekNumber: number) => void;
}

export const WeekPicker = ({ year, availableWeeks, onWeekClick }: WeekPickerProps) => {
  const weekList = useMemo(() => {
    const totalWeeks = getWeeksInYear(year);
    const weeks = [];
    for (let i = 1; i <= totalWeeks; i++) {
        const weekString = formatWeekString(year, i);
        weeks.push({
            weekNumber: i,
            weekString,
            isAvailable: availableWeeks.has(weekString),
        });
    }
    return weeks;
  }, [year, availableWeeks]);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-200">
        <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
            {weekList.map((w) => (
            <button
                key={w.weekString}
                onClick={() => onWeekClick(w.weekNumber)}
                className={`
                    py-2 px-1 rounded-md text-sm transition-all duration-200 border
                    flex flex-col items-center justify-center gap-1
                    ${
                        w.isAvailable
                        ? 'border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 font-medium hover:border-violet-400 hover:shadow-sm'
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                    }
                `}
                title={`Jump to ${w.weekString}`}
            >
                <span>w{w.weekNumber.toString().padStart(2, '0')}</span>
                {w.isAvailable && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50"></span>
                )}
            </button>
            ))}
        </div>
    </div>
  );
};
