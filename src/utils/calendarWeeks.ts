// Calendar Week Logic
// Based on QPerform requirements for week-to-month mapping

/**
 * Get the start of the calendar week (Sunday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday = 0
  return new Date(d.setDate(diff));
}

/**
 * Get the end of the calendar week (Saturday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

/**
 * Count how many days of a week fall in a specific month
 */
export function countDaysInMonth(weekStart: Date, weekEnd: Date, month: number, year: number): number {
  let count = 0;
  const current = new Date(weekStart);

  while (current <= weekEnd) {
    if (current.getMonth() === month && current.getFullYear() === year) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Determine which month a week belongs to based on the 3+ days rule
 *
 * Rule: A week counts for the month that contains 3 or more days of that week
 * Example: Week of 09/28/25-10/04/25 has 4 days in October, so it counts for October
 */
export function determineWeekMonth(weekStart: Date, weekEnd: Date): { month: number; year: number } {
  const weekStartMonth = weekStart.getMonth();
  const weekStartYear = weekStart.getFullYear();
  const weekEndMonth = weekEnd.getMonth();
  const weekEndYear = weekEnd.getFullYear();

  // If week is entirely within one month, easy
  if (weekStartMonth === weekEndMonth && weekStartYear === weekEndYear) {
    return { month: weekStartMonth, year: weekStartYear };
  }

  // Count days in each month
  const daysInStartMonth = countDaysInMonth(weekStart, weekEnd, weekStartMonth, weekStartYear);
  const daysInEndMonth = countDaysInMonth(weekStart, weekEnd, weekEndMonth, weekEndYear);

  // Week belongs to the month with 3+ days
  if (daysInStartMonth >= 3) {
    return { month: weekStartMonth, year: weekStartYear };
  } else if (daysInEndMonth >= 3) {
    return { month: weekEndMonth, year: weekEndYear };
  }

  // Fallback: use the month with more days
  if (daysInStartMonth > daysInEndMonth) {
    return { month: weekStartMonth, year: weekStartYear };
  } else {
    return { month: weekEndMonth, year: weekEndYear };
  }
}

/**
 * Get all calendar weeks for a given month
 */
export function getWeeksForMonth(month: number, year: number): Array<{ start: Date; end: Date }> {
  const weeks: Array<{ start: Date; end: Date }> = [];

  // Start from the first day of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get the first week that includes any day of this month
  let currentWeekStart = getWeekStart(firstDay);

  // Iterate through weeks until we're past the last day of the month
  while (currentWeekStart <= lastDay) {
    const currentWeekEnd = getWeekEnd(currentWeekStart);

    // Check if this week should count for this month (3+ days rule)
    const weekMonth = determineWeekMonth(currentWeekStart, currentWeekEnd);

    if (weekMonth.month === month && weekMonth.year === year) {
      weeks.push({
        start: new Date(currentWeekStart),
        end: new Date(currentWeekEnd)
      });
    }

    // Move to next week
    currentWeekStart = new Date(currentWeekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  return weeks;
}

/**
 * Format week range as string
 */
export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
  };

  return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
}

/**
 * Get month name from month number
 */
export function getMonthName(month: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month];
}

/**
 * Parse a week range string back to dates
 */
export function parseWeekRange(weekRangeString: string): { start: Date; end: Date } | null {
  try {
    // Expected format: "MM/DD/YY - MM/DD/YY"
    const parts = weekRangeString.split(' - ');
    if (parts.length !== 2) return null;

    const start = new Date(parts[0]);
    const end = new Date(parts[1]);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    return { start, end };
  } catch {
    return null;
  }
}

/**
 * Check if a date falls within a specific week
 */
export function isDateInWeek(date: Date, weekStart: Date, weekEnd: Date): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);

  const end = new Date(weekEnd);
  end.setHours(23, 59, 59, 999);

  return d >= start && d <= end;
}

/**
 * Get the week number within a month (1-based)
 */
export function getWeekNumberInMonth(weekStart: Date, month: number, year: number): number {
  const weeks = getWeeksForMonth(month, year);
  const weekStartTime = weekStart.getTime();

  const index = weeks.findIndex(week => week.start.getTime() === weekStartTime);
  return index >= 0 ? index + 1 : 0;
}

/**
 * Example usage and test case
 */
export function testWeekMapping() {
  // Test case from requirements: Week of 09/28/25-10/04/25 should count for October
  const weekStart = new Date(2025, 8, 28); // September 28, 2025 (month is 0-indexed)
  const weekEnd = new Date(2025, 9, 4);    // October 4, 2025

  const daysInSeptember = countDaysInMonth(weekStart, weekEnd, 8, 2025);
  const daysInOctober = countDaysInMonth(weekStart, weekEnd, 9, 2025);

  console.log('Test Case: Week of 09/28/25-10/04/25');
  console.log(`Days in September: ${daysInSeptember}`); // Should be 3
  console.log(`Days in October: ${daysInOctober}`);     // Should be 4

  const weekMonth = determineWeekMonth(weekStart, weekEnd);
  console.log(`Week belongs to: ${getMonthName(weekMonth.month)} ${weekMonth.year}`); // Should be October 2025

  return weekMonth.month === 9; // True if test passes (October = month 9)
}
