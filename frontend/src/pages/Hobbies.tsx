/**
 * Photography page — spec §4.7.
 *
 * Toolbar parameters:
 *   - Devices  : multi-select filter chips (1, 2, 3)
 *   - Location : dropdown checklist
 *   - Year     : multi-select chips (chronological grouping)
 *   - Sorting  : year desc / year asc / location alpha
 *
 * Presentation:
 *   - Responsive thumbnail grid.
 *   - Selecting a thumbnail opens the Lightbox component (high-resolution
 *     image + description + tags).
 */

import { useEffect, useMemo, useState } from "react";
import type { Device, Photo } from "../lib/types";
import { loadDevices, loadPhotos } from "../lib/data";
import { Lightbox } from "../components/Lightbox";
import { PageHeader } from "../components/PageHeader";
import { FilterChip } from "../components/FilterChip";
import { SortDropdown } from "../components/SortDropdown";

type SortKey = "year_desc" | "year_asc" | "location";

const SORT_OPTIONS = [
  { value: "year_desc", label: "Year (new → old)" },
  { value: "year_asc", label: "Year (old → new)" },
  { value: "location", label: "Location (A → Z)" },
] as const satisfies ReadonlyArray<{ value: SortKey; label: string }>;

export function Photography() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDevices, setActiveDevices] = useState<Set<string>>(new Set());
  const [activeYears, setActiveYears] = useState<Set<number>>(new Set());
  const [activeLocation, setActiveLocation] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("year_desc");
  const [open, setOpen] = useState<Photo | null>(null);

  useEffect(() => {
    Promise.all([loadPhotos(), loadDevices()]).then(([p, d]) => {
      setPhotos(p);
      setDevices(d);
    });
  }, []);

  const yearOptions = useMemo(() => {
    return Array.from(new Set(photos.map((p) => p.year))).sort((a, b) => b - a);
  }, [photos]);

  const locationOptions = useMemo(() => {
    return Array.from(new Set(photos.map((p) => p.location))).sort();
  }, [photos]);

  const filtered = useMemo(() => {
    let out = photos.filter((p) => {
      if (activeDevices.size > 0 && !activeDevices.has(p.device_id))
        return false;
      if (activeYears.size > 0 && !activeYears.has(p.year)) return false;
      if (activeLocation && p.location !== activeLocation) return false;
      return true;
    });
    const cmp: Record<SortKey, (a: Photo, b: Photo) => number> = {
      year_desc: (a, b) => b.year - a.year || a.location.localeCompare(b.location),
      year_asc: (a, b) => a.year - b.year || a.location.localeCompare(b.location),
      location: (a, b) => a.location.localeCompare(b.location),
    };
    out = [...out].sort(cmp[sortKey]);
    return out;
  }, [photos, activeDevices, activeYears, activeLocation, sortKey]);

  const toggleDevice = (id: string) =>
    setActiveDevices((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleYear = (y: number) =>
    setActiveYears((prev) => {
      const next = new Set(prev);
      next.has(y) ? next.delete(y) : next.add(y);
      return next;
    });

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <PageHeader
        eyebrow="Photography"
        title="Frames and field notes"
        subtitle="An asset gallery indexed by device, location, and year. Selecting any thumbnail opens a high-resolution lightbox with description and tags."
      />

      <div className="mb-8 flex flex-col gap-4 border-b border-ink-200/60 pb-5 dark:border-ink-700/60">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-widest text-ink-400">
            Devices
          </span>
          {devices.map((d) => (
            <FilterChip
              key={d.id}
              label={d.name}
              active={activeDevices.has(d.id)}
              onToggle={() => toggleDevice(d.id)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-widest text-ink-400">
            Year
          </span>
          {yearOptions.map((y) => (
            <FilterChip
              key={y}
              label={String(y)}
              active={activeYears.has(y)}
              onToggle={() => toggleYear(y)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
            <span className="font-medium uppercase tracking-widest">
              Location
            </span>
            <select
              value={activeLocation}
              onChange={(e) => setActiveLocation(e.target.value)}
              className="rounded-md border border-ink-200 bg-ink-50 px-2 py-1 text-xs text-ink-700 focus:border-accent focus:outline-none dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
            >
              <option value="">All</option>
              {locationOptions.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <SortDropdown
            value={sortKey}
            options={SORT_OPTIONS}
            onChange={(v) => setSortKey(v)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-500 dark:text-ink-400">
          No photographs match the current filters.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setOpen(p)}
                className="group block w-full overflow-hidden rounded-lg border border-ink-200 bg-ink-100 focus:outline-none focus-visible:border-accent dark:border-ink-700 dark:bg-ink-800"
                aria-haspopup="dialog"
                aria-label={`${p.location}, ${p.year}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={p.image_url}
                    alt={p.description_md || `${p.location}, ${p.year}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity =
                        "0.2";
                    }}
                  />
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 text-xs">
                  <span className="text-ink-600 dark:text-ink-200">
                    {p.location}
                  </span>
                  <span className="text-ink-400">{p.year}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Lightbox photo={open} onClose={() => setOpen(null)} />
    </section>
  );
}
