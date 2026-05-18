/**
 * Small formatting helpers used across pages.
 */

/** Format a YYYY-MM-DD string as a human-readable month + year (e.g. "Aug 2024"). */
export function formatMonthYear(iso: string | null, fallback = "Present"): string {
  if (!iso) return fallback;
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Format a rating to two-decimal precision (e.g. 9.5 -> "9.50"). */
export function formatRating(r: number): string {
  return r.toFixed(2);
}
