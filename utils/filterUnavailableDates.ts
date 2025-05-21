import dayjs from "dayjs";
import { CLIENT_LISTING_CALENDAR_RETURN } from "./types";

// Minimum number of consecutive days required for a valid booking window
const MIN_BOOKABLE_DAYS = 30;
// Today's date at midnight, used as the start of the rolling window
const TODAY = dayjs().startOf('day');

/**
 * Finds all consecutive runs of dates of at least `minLen` days in a sorted array of ISO strings.
 * @param dateStrs - Array of ISO date strings to search
 * @param minLen - Minimum length of a valid run (in days)
 * @returns Array of Dayjs arrays, each representing a valid run
 */
function findLongRuns(
  dateStrs: string[],
  minLen: number
): dayjs.Dayjs[][] {
  // Parse and normalize to start of day, then sort ascending
  const dates = dateStrs
    .map(d => dayjs(d).startOf('day'))
    .sort((a, b) => a.valueOf() - b.valueOf());

  const runs: dayjs.Dayjs[][] = [];
  let seq: dayjs.Dayjs[] = [];

  for (let i = 0; i < dates.length; i++) {
    const cur = dates[i];
    const prev = dates[i - 1];
    // If first element or immediately consecutive, extend sequence
    if (!prev || cur.diff(prev, 'day') === 1) {
      seq.push(cur);
    } else {
      // Otherwise, break and record if long enough
      if (seq.length >= minLen) runs.push(seq);
      seq = [cur];
    }
  }
  // Final check at end of loop
  if (seq.length >= minLen) runs.push(seq);
  return runs;
}

/**
 * Merges existing unavailable dates with a rolling window of the next
 * `MIN_BOOKABLE_DAYS` days, then returns a deduplicated, sorted list
 * of Date objects representing all fully blocked 30-day+ runs.
 *
 * @param input - Either an array of ISO strings or a `CLIENT_LISTING_CALENDAR_RETURN`
 * @returns A `CLIENT_LISTING_CALENDAR_RETURN` with `items` as Date[]
 */
export function filterUnavailableDates(
  input: string[] | CLIENT_LISTING_CALENDAR_RETURN
): CLIENT_LISTING_CALENDAR_RETURN {
  // Normalize input to an array of ISO strings
  const inputDates: string[] = Array.isArray(input)
    ? input
    : input.items.map(date => date.toISOString());

  // Build the next 30-day rolling window from today
  const windowDates = Array.from({ length: MIN_BOOKABLE_DAYS }, (_, i) =>
    TODAY.add(i, 'day').toISOString()
  );

  // Find all runs in both sets
  const runs = [
    ...findLongRuns(inputDates, MIN_BOOKABLE_DAYS).flat(),
    ...findLongRuns(windowDates, MIN_BOOKABLE_DAYS).flat(),
  ];

  // Convert to ISO strings, dedupe, sort, then to Date objects
  const uniqueSorted = Array.from(new Set(runs.map(d => d.toISOString())))
    .sort()
    .map(d => new Date(d));

  return { items: uniqueSorted };
}
