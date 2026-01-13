interface YearPickerProps {
    startYear: number;
    currentYear: number;
    onSelect: (year: number) => void;
}

export const YearPicker = ({ startYear, currentYear, onSelect }: YearPickerProps) => {
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
        <div className="grid grid-cols-3 gap-3 p-2 animate-in fade-in zoom-in-95 duration-200">
            {years.map((y) => (
                <button
                    key={y}
                    onClick={() => onSelect(y)}
                    className={`
                        py-3 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                            currentYear === y
                                ? 'bg-violet-600 text-white shadow-md'
                                : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:scale-105'
                        }
                    `}
                >
                    {y}
                </button>
            ))}
        </div>
    );
};
