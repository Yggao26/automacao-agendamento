export function formatLocalDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function parseLocalDateTime(value: string) {
  const match = /^\s*(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})\s*$/.exec(
    value,
  );

  if (!match) return null;

  const [, year, month, day, hours, minutes] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    0,
    0,
  );

  return Number.isNaN(date.getTime()) ? null : date;
}