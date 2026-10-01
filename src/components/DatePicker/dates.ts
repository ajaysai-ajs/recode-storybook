/*
 * Small date helpers for the Date Picker. Plain JavaScript dates - no library needed.
 * All dates are "calendar days" at local midnight; times are ignored.
 */

/** Strips the time, so two dates on the same day compare as equal. */
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

/** Moves by whole months, keeping the day where possible (Jan 31 + 1 month = Feb 28/29). */
export function addMonths(d: Date, months: number) {
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), lastDay));
}

/** The 6 weeks x 7 days shown for a month, starting on Sunday (as in Figma). */
export function monthGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const start = addDays(first, -first.getDay()); // back to the Sunday on or before the 1st
  return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)));
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Formats a date as MM/DD/YYYY, the format shown in Figma ("12/18/2022"). */
export const formatDate = (d: Date) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;

/** Reads "12/18/2022" or "1/5/2023". Returns null if the text isn't a real date. */
export function parseDate(text: string): Date | null {
  const match = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/.exec(text);
  if (!match) return null;
  const [month, day, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  // Reject dates that roll over, like 02/31/2024
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
