/**
 * SortDropdown — labeled <select> wrapper used by Books and Hobbies.
 */

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label?: string;
  value: T;
  options: ReadonlyArray<SortOption<T>>;
  onChange: (value: T) => void;
  id?: string;
}

export function SortDropdown<T extends string>({
  label = "Sort",
  value,
  options,
  onChange,
  id = "sort-dropdown",
}: Props<T>) {
  return (
    <label
      htmlFor={id}
      className="inline-flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400"
    >
      <span>{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-md border border-ink-200 bg-ink-50 px-2 py-1 text-xs text-ink-700 focus:border-accent focus:outline-none dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
