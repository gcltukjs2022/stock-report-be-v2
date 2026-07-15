function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function getAllowedDates(today = new Date()): Set<string> {
  const allowed = new Set<string>();

  // Always include today
  allowed.add(formatDate(today));

  // Sunday = 0, Monday = 1
  if (today.getDay() === 1) {
    // Saturday
    const saturday = new Date(today);
    saturday.setDate(today.getDate() - 2);
    allowed.add(formatDate(saturday));

    // Sunday
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - 1);
    allowed.add(formatDate(sunday));
  }

  return allowed;
}

export default getAllowedDates;
