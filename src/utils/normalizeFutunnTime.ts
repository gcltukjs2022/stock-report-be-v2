/**
 * Futunn's news list only shows a bare time (HH:MM) for items published
 * "today", and switches to a full date (no time) once an item is older.
 * This normalizes both cases into the same dateRaw/dateYYYYMMDD shape
 * used by the rest of the pipeline.
 */

function normalizeFutunnTime(rawText: string): {
  dateRaw: string | null;
  dateYYYYMMDD: string | null;
} {
  const text = rawText.trim();
  const now = new Date();

  // Case 1: "HH:MM" -> today's date
  const timeOnlyMatch = text.match(/^(\d{1,2}):(\d{2})$/);
  if (timeOnlyMatch) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = timeOnlyMatch[1].padStart(2, "0");
    const mm = timeOnlyMatch[2];
    return {
      dateRaw: `${y}/${m}/${d} ${hh}:${mm}`,
      dateYYYYMMDD: `${y}${m}${d}`,
    };
  }

  // Case 2: "MM/DD HH:MM" -> older items (e.g. "07/12 09:08")
  // Year isn't shown, so assume current year, but if that date would be
  // in the future (e.g. scraping in January and seeing "12/30"), it must
  // actually be last year.
  const monthDayTimeMatch = text.match(
    /^(\d{2})\/(\d{2})\s+(\d{1,2}):(\d{2})$/,
  );
  if (monthDayTimeMatch) {
    const [, m, d, hh, mm] = monthDayTimeMatch;
    let y = now.getFullYear();

    const candidate = new Date(y, Number(m) - 1, Number(d));
    if (candidate.getTime() > now.getTime()) {
      y -= 1;
    }

    const hhPadded = hh.padStart(2, "0");
    return {
      dateRaw: `${y}/${m}/${d} ${hhPadded}:${mm}`,
      dateYYYYMMDD: `${y}${m}${d}`,
    };
  }

  return { dateRaw: null, dateYYYYMMDD: null };
}
export default normalizeFutunnTime;
