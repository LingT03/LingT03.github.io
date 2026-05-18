/**
 * Data-loading utilities.
 *
 * The Python build pipeline emits one JSON file per content type into
 * /public/data/. We fetch them once per session via a module-level cache so
 * page transitions are instantaneous.
 */

import type {
  Book,
  Course,
  Degree,
  Device,
  Job,
  Photo,
  Project,
  TechStackItem,
} from "./types";

type DataBundle = {
  tech_stack: TechStackItem[];
  devices: Device[];
  degrees: Degree[];
  courses: Course[];
  jobs: Job[];
  projects: Project[];
  books: Book[];
  photos: Photo[];
};

// Module-level cache keyed by JSON file name. Cast on read; writes use a
// permissive index because TypeScript cannot narrow `DataBundle[typeof name]`
// for an arbitrary `name` extends `keyof DataBundle`.
const cache: Record<string, unknown[]> = {};
const inflight: Record<string, Promise<unknown[]>> = {};

async function fetchJson<T>(name: keyof DataBundle): Promise<T[]> {
  const key = name as string;
  if (Object.prototype.hasOwnProperty.call(cache, key)) {
    return cache[key] as T[];
  }
  if (Object.prototype.hasOwnProperty.call(inflight, key)) {
    return (await inflight[key]) as T[];
  }

  const p = fetch(`/data/${name}.json`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`Failed to load ${name}: ${res.status}`);
      const data = (await res.json()) as T[];
      cache[key] = data as unknown[];
      return data as unknown[];
    })
    .finally(() => {
      delete inflight[key];
    });
  inflight[key] = p;
  return (await p) as T[];
}

export const loadTechStack = () => fetchJson<TechStackItem>("tech_stack");
export const loadDevices = () => fetchJson<Device>("devices");
export const loadDegrees = () => fetchJson<Degree>("degrees");
export const loadCourses = () => fetchJson<Course>("courses");
export const loadJobs = () => fetchJson<Job>("jobs");
export const loadProjects = () => fetchJson<Project>("projects");
export const loadBooks = () => fetchJson<Book>("books");
export const loadPhotos = () => fetchJson<Photo>("photos");
