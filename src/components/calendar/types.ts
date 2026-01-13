export type CalendarMode =
  | "calendar"
  | "week-picker"
  | "month-picker"
  | "year-picker";

export interface UnifiedCalendarProps {
  /** List of available dates (YYYY-MM-DD) */
  availableDates: string[];
  /** List of available weeks (YYYY-Www) */
  availableWeeks: string[];
  /** Currently selected date (YYYY-MM-DD) */
  currentDate?: string;
  /** Currently selected week (YYYY-Www) */
  currentWeek?: string;
}

export interface DateItem {
  date: number;
  dateString: string;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  isSelected: boolean;
}

export interface WeekRow {
  weekNumber: number;
  weekYear: number;
  weekString: string;
  isWeekAvailable: boolean;
  isWeekSelected: boolean;
  days: DateItem[];
}
