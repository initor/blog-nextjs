/** "October 6, 2026" for a YYYY-MM-DD date, the same in every time zone. */
export function formatPieceDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
