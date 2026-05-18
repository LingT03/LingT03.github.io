/**
 * FilterChip — toggleable pill used by Academic (course tags), Books
 * (categories), and Photography (devices/locations/years).
 *
 * Spec §7.3: tab-indexable; aria-pressed reflects state for screen readers.
 */

interface Props {
  label: string;
  active: boolean;
  onToggle: () => void;
  count?: number;
}

export function FilterChip({ label, active, onToggle, count }: Props) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 ease-apple ${
        active
          ? "border-accent bg-accent text-white"
          : "border-ink-200 bg-transparent text-ink-600 hover:border-ink-300 hover:text-ink-700 dark:border-ink-700 dark:text-ink-200 dark:hover:border-ink-500"
      }`}
    >
      {label}
      {typeof count === "number" && (
        <span
          className={`rounded-full px-1.5 text-[10px] ${
            active
              ? "bg-white/20 text-white"
              : "bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-300"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
