import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import { CLIENT_LISTING_CALENDAR_RETURN } from "./types";

// Minimum number of consecutive days required for a valid booking window
const MIN_BOOKABLE_DAYS = 30;

// Today's date at UTC midnight (we only use it to compute the 30-day window)
const TODAY = dayjs.utc().startOf("day");

/**
 * Finds all consecutive runs of dates of at least `minLen` days in a sorted array of ISO strings.
 */
function findLongRuns(
  dateStrs: string[],
  minLen: number
): dayjs.Dayjs[][] {
  const dates = dateStrs
    .map(d => dayjs.utc(d).startOf("day"))
    .sort((a, b) => a.valueOf() - b.valueOf());

  const runs: dayjs.Dayjs[][] = [];
  let seq: dayjs.Dayjs[] = [];

  for (let i = 0; i < dates.length; i++) {
    const cur = dates[i];
    const prev = dates[i - 1];
    if (!prev || cur.diff(prev, "day") === 1) {
      seq.push(cur);
    } else {
      if (seq.length >= minLen) runs.push(seq);
      seq = [cur];
    }
  }
  if (seq.length >= minLen) runs.push(seq);
  return runs;
}

/**
 * Merges existing unavailable dates with the next 30-day window,
 * then returns them as LOCAL-midnight strings ("YYYY-MM-DDT00:00"),
 * which JavaScript will always parse as that date in the **local** timezone.
 */
export function filterUnavailableDates(
  input: string[] | CLIENT_LISTING_CALENDAR_RETURN
): CLIENT_LISTING_CALENDAR_RETURN {
  // 1) Normalize input to ISO strings
  const inputDates: string[] = Array.isArray(input)
    ? input
    : input.items.map(d => d.toISOString());

  // 2) Build the next 30-day rolling window from TODAY (UTC)
  const windowDates = Array.from({ length: MIN_BOOKABLE_DAYS }, (_, i) =>
    TODAY.add(i, "day").toISOString()
  );

  // 3) Find all ≥30-day runs across both sets
  const allRuns = [
    ...findLongRuns(inputDates, MIN_BOOKABLE_DAYS).flat(),
    ...findLongRuns(windowDates,  MIN_BOOKABLE_DAYS).flat(),
  ];

  // 4) Format each Dayjs as "YYYY-MM-DDT00:00" (no "Z"), dedupe & sort
  const uniqueLocalMidnight = Array.from(
    new Set(allRuns.map(d => d.format("YYYY-MM-DD") + "T00:00"))
  ).sort();

  // 5) Convert strings to Date objects and return
  return { items: uniqueLocalMidnight.map(str => new Date(str)) };
}