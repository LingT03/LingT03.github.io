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

export interface Project {
  id: string;
  title: string;
  short_description_md: string;
  short_description_md_html: string;
  long_description_md: string;
  long_description_md_html: string;
  tech_stack: string[];
  links: Record<string, string>;
  status: "in_progress" | "completed" | "archived";
}

export type BookCategory = "Learning" | "Nonfiction" | "Fiction";

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  rating: number;
  cover_image_url: string | null;
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
