/**
 * TypeScript interfaces mirroring the Pydantic schemas in scripts/schemas.py.
 * Every record loaded via fetch() from /public/data/*.json should be cast to
 * one of these types — keeping the type system aligned with the validated
 * Python source of truth.
 */

export interface TechStackItem {
  id: string;
  name: string;
  logo_url: string | null;
  category: "language" | "framework" | "tool" | null;
  level: number | null;
}

export interface Degree {
  id: string;
  institution: string;
  degree_type: string;
  majors: string[];
  concentration: string | null;
  start_date: string;
  end_date: string | null;
  overview_md: string;
  overview_md_html: string;
}

export interface Course {
  id: string;
  degree_id: string;
  name: string;
  code: string;
  short_description_md: string;
  short_description_md_html: string;
  tags: string[];
}

export interface Job {
  id: string;
  title: string;
  organization: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description_md: string;
  description_md_html: string;
  tech_stack: string[];
}

export interface Author {
  name: string;
  // Bare ORCID iD (e.g. "0000-0003-3134-8846"); the UI expands it to
  // https://orcid.org/<id>. null when the author has no linked ORCID.
  orcid: string | null;
}

export type PublicationStatus =
  | "preprint"
  | "published"
  | "under_review"
  | "in_preparation";

export interface Publication {
  id: string;
  title: string;
  authors: Author[];
  venue: string;
  status: PublicationStatus;
  // Bare DOI (e.g. "10.1101/2025.06.02.657296"); resolved to
  // https://doi.org/<doi> at render time.
  doi: string | null;
  url: string | null;
  published_date: string | null;
  links: Record<string, string>;
  tags: string[];
  abstract_md: string;
  abstract_md_html: string;
}

export type ProjectStatus =
  | "in_progress"
  | "completed"
  | "archived"
  | "prototype"
  | "active";

export interface Project {
  id: string;
  title: string;
  short_description_md: string;
  short_description_md_html: string;
  long_description_md: string;
  long_description_md_html: string;
  tech_stack: string[];
  links: Record<string, string>;
  status: ProjectStatus;
  role: string | null;
  timeframe: string | null;
  tags: string[];
}

export type BookCategory = "Fiction" | "Nonfiction" | "Textbook";

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  rating: number | null;
  cover_image_url: string | null;
  open_library_key: string | null;
  isbn: string | null;
  started_at: string | null;
  finished_at: string | null;
  summary_md: string;
  summary_md_html: string;
  notes_md: string | null;
  notes_md_html: string;
  tags: string[];
}

export interface Device {
  id: string;
  name: string;
  type: "camera" | "phone" | "other";
}

export interface Photo {
  id: string;
  image_url: string;
  location: string;
  year: number;
  device_id: string;
  description_md: string | null;
  description_md_html: string;
  tags: string[];
}
