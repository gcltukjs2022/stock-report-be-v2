function toYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}${m}${d}`;
}

function astocksGetValidDates(referenceDate: Date = new Date()): Set<string> {
  const dates = new Set<string>();
  const today = new Date(referenceDate);
  dates.add(toYYYYMMDD(today));

  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...

  if (dayOfWeek === 1) {
    const saturday = new Date(today);
    saturday.setDate(today.getDate() - 2);

    const sunday = new Date(today);
    sunday.setDate(today.getDate() - 1);

    dates.add(toYYYYMMDD(saturday));
    dates.add(toYYYYMMDD(sunday));
  }

  return dates;
}

export default astocksGetValidDates;
