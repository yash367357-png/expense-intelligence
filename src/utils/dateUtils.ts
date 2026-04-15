import {
  format,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  getWeek,
  getYear,
} from 'date-fns';

/**
 * Format a date string as "DD MMM YYYY" (e.g. "14 Apr 2026")
 */
export function formatDate(date: string): string {
  return format(parseISO(date), 'dd MMM yyyy');
}

/**
 * Returns the month key in "YYYY-MM" format (e.g. "2026-04")
 */
export function getMonthKey(date: string): string {
  return format(parseISO(date), 'yyyy-MM');
}

/**
 * Returns the ISO week key in "YYYY-WNN" format (e.g. "2026-W16")
 */
export function getWeekKey(date: string): string {
  const parsed = parseISO(date);
  const year = getYear(parsed);
  const week = getWeek(parsed, { weekStartsOn: 1 });
  const weekStr = String(week).padStart(2, '0');
  return `${year}-W${weekStr}`;
}

/**
 * Returns true if the given date falls within [start, end] (inclusive).
 * All arguments should be ISO date strings.
 */
export function isInDateRange(date: string, start: string, end: string): boolean {
  return isWithinInterval(parseISO(date), {
    start: parseISO(start),
    end: parseISO(end),
  });
}

/**
 * Returns the start and end ISO strings for the current calendar month.
 */
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: startOfMonth(now).toISOString(),
    end: endOfMonth(now).toISOString(),
  };
}

/**
 * Returns the start and end ISO strings for the given year/month (1-based month).
 */
export function getMonthRange(
  year: number,
  month: number
): { start: string; end: string } {
  const date = new Date(year, month - 1, 1);
  return {
    start: startOfMonth(date).toISOString(),
    end: endOfMonth(date).toISOString(),
  };
}
