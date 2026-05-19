/**
 * Hobbies page — V2 §3.6 (formerly /photography).
 *
 * Replaces the legacy device-filter list with a grid of structured
 * device cards that mirror the Projects layout. Each card carries a
 * dedicated `<canvas>` container referenced via `canvas-{device.id}`
 * so a future Three.js / WebGL pass can mount a 3D product model
 * inside the cell without touching the markup tree (V2 §3.6 expansion
 * hook).
 *
 * The legacy photo-gallery toolbar (device chip + year + location +
 * lightbox) is preserved beneath the device grid so existing content
 * remains discoverable while the 3D-card layer is under construction.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
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

/**
 * Explicit V2 §3.6 device-card ordering. Devices not in this map sink
 * to the end of the grid (alphabetical fallback).
 */
const DEVICE_ORDER: Readonly<Record<string, number>> = {
  "fujifilm-x-s20": 0,
  "dji-action-5": 1,
  "iphone-15-pro": 2,
};

export function Hobbies() {
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

  const orderedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      const ai = DEVICE_ORDER[a.id] ?? Number.MAX_SAFE_INTEGER;
      const bi = DEVICE_ORDER[b.id] ?? Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    });
  }, [devices]);

  const photoCountByDevice = useMemo(() => {
    const m = new Map<string, number>();
    photos.forEach((p) => m.set(p.device_id, (m.get(p.device_id) ?? 0) + 1));
    return m;
  }, [photos]);

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
      year_desc: (a, b) =>
        b.year - a.year || a.location.localeCompare(b.location),
      year_asc: (a, b) =>
        a.year - b.year || a.location.localeCompare(b.location),
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
        eyebrow="Hobbies"
        title="Devices and field notes"
        subtitle="Photography rigs and personal devices as a grid of structured cards. Each card reserves a canvas slot for an interactive 3D model — coming next."
      />

      {/* Device grid (V2 §3.6) ---------------------------------------- */}
      <ul className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orderedDevices.map((d) => (
          <li key={d.id}>
            <DeviceCard
              device={d}
              photoCount={photoCountByDevice.get(d.id) ?? 0}
              active={activeDevices.has(d.id)}
              onToggle={() => toggleDevice(d.id)}
            />
          </li>
        ))}
      </ul>

      {/* Legacy photo-gallery toolbar (preserved for now) ------------- */}
      {photos.length > 0 && (
        <>
          <div className="mb-8 flex flex-col gap-4 border-t border-ink-200/60 pt-8 dark:border-ink-700/60">
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
        </>
      )}

      <Lightbox photo={open} onClose={() => setOpen(null)} />
    </section>
  );
}

/* --------------------------- Device card --------------------------- */

interface DeviceCardProps {
  device: Device;
  photoCount: number;
  active: boolean;
  onToggle: () => void;
}

/**
 * A single device cell matching the Projects card layout.
 *
 * Each cell reserves a `<canvas>` element keyed by `canvas-{device.id}`.
 * The canvas is currently inert (no WebGL context); a future Three.js
 * pass can locate it via `document.getElementById` or React refs and
 * mount a product model without restructuring the page.
 */
function DeviceCard({
  device,
  photoCount,
  active,
  onToggle,
}: DeviceCardProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className={
        "flex h-full w-full flex-col rounded-xl border bg-ink-50 p-5 text-left shadow-sm transition-[border-color,box-shadow] duration-200 hover:shadow-md dark:bg-ink-800 " +
        (active
          ? "border-accent shadow-md"
          : "border-ink-200 hover:border-accent/60 dark:border-ink-700 dark:hover:border-accent/60")
      }
      aria-pressed={active}
      aria-label={`Filter by ${device.name}`}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-700 dark:text-ink-50">
            {device.name}
          </h3>
          <p className="mt-0.5 text-xs uppercase tracking-widest text-ink-400">
            {device.type}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-500 dark:bg-ink-700 dark:text-ink-300">
          {photoCount} {photoCount === 1 ? "photo" : "photos"}
        </span>
      </header>

      {/* WebGL / Three.js mount slot (V2 §3.6 expansion hook). */}
      <div
        className="relative mt-1 aspect-video w-full overflow-hidden rounded-lg border border-dashed border-ink-200 bg-ink-100 dark:border-ink-700 dark:bg-ink-900/40"
        data-device-canvas={device.id}
      >
        <canvas
          ref={canvasRef}
          id={`canvas-${device.id}`}
          aria-hidden
          className="absolute inset-0 h-full w-full"
        />
        <p className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-ink-400 dark:text-ink-500">
          3D model · pending
        </p>
      </div>
    </motion.button>
  );
}
