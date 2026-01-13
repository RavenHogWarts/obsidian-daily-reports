interface MonthPickerProps {
    currentMonth: number; // 0-11
    onSelect: (monthIndex: number) => void;
}

export const MonthPicker = ({ currentMonth, onSelect }: MonthPickerProps) => {
    return (
        <div className="grid grid-cols-3 gap-3 p-2 animate-in fade-in zoom-in-95 duration-200">
            {Array.from({ length: 12 }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(i)}
                    className={`
                        py-3 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                            currentMonth === i
                                ? 'bg-violet-600 text-white shadow-md'
                                : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:scale-105'
                        }
                    `}
                >
                    {i + 1} 月
                </button>
            ))}
        </div>
    );
};
