import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import { CLIENT_LISTING_CALENDAR_RETURN } from "./types";

const MIN_BOOKABLE_DAYS = 30;
const TODAY = dayjs.utc().startOf("day");

function findLongRuns(
  dateStrs: string[],
  minLen: number
): dayjs.Dayjs[][] {
  const dates = dateStrs
    .map((d) => dayjs.utc(d).startOf("day"))
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

export function filterUnavailableDates(
  input: string[] | CLIENT_LISTING_CALENDAR_RETURN
): CLIENT_LISTING_CALENDAR_RETURN {
  // 1) Normalize input to ISO strings
  const inputDates: string[] = Array.isArray(input)
    ? input
    : input.items.map((d) => d.toISOString());

  // 2) Build the next 30-day window from TODAY (UTC)
  const windowDates = Array.from({ length: MIN_BOOKABLE_DAYS }, (_, i) =>
    TODAY.add(i, "day").toISOString()
  );

  // 3) Gather all ≥30-day runs
  const allRuns = [
    ...findLongRuns(inputDates, MIN_BOOKABLE_DAYS).flat(),
    ...findLongRuns(windowDates, MIN_BOOKABLE_DAYS).flat(),
  ];

  // 4) Emit pure “YYYY-MM-DD” strings, deduped & sorted
  const uniqueDates = Array.from(
    new Set(allRuns.map((d) => d.format("YYYY-MM-DD")))
  ).sort();

  // 5) Return those strings — no Date objects, no Z‐timestamps
  return {items: uniqueDates} 
}