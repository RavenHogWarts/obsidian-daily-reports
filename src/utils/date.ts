export function parseWeekString(weekStr: string): {
  year: number;
  week: number;
} {
  const match = weekStr.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    const today = new Date();
    return { year: today.getFullYear(), week: getISOWeek(today) };
  }
  return {
    year: parseInt(match[1], 10),
    week: parseInt(match[2], 10),
  };
}

export function getISOWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getISOYear(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

export function getDateFromWeek(year: number, week: number): Date {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  else ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  return ISOweekStart;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatWeekString(year: number, week: number): string {
  return `${year}-W${week.toString().padStart(2, "0")}`;
}

export function getWeeksInYear(year: number): number {
  const p2 = new Date(year, 11, 31);
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  // If Dec 31 is Thursday, or Wednesday in leap year, it's 53 weeks
  const day = p2.getDay();
  return day === 4 || (isLeap && day === 3) ? 53 : 52;
}
