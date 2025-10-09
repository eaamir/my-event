import jalaali from 'jalaali-js';

// Assuming input strings in "YYYY-MM-DD" (jalaali) format.
// Convert jalaali date string to JS Date (UTC midnight of that jalaali day).
export function jalaaliToDate(jalaaliDateStr: string): Date {
  // Accepts "YYYY-MM-DD"
  const parts = jalaaliDateStr.split('-').map(Number);
  if (parts.length !== 3)
    throw new Error('Invalid jalaali date format, expected YYYY-MM-DD');

  const [jy, jm, jd] = parts;
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return new Date(Date.UTC(gy, gm - 1, gd));
}

// Compare "today" (using local Date) to jalaali date strings
export function todayIsBefore(jalaaliDateStr: string): boolean {
  const today = new Date();
  const target = jalaaliToDate(jalaaliDateStr);
  return today < target;
}

export function todayIsAfter(jalaaliDateStr: string): boolean {
  const today = new Date();
  const target = jalaaliToDate(jalaaliDateStr);
  return today > target;
}
