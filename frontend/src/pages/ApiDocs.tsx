/**
 * ApiDocs page (V2 §2.1).
 *
 * Comprehensive reference for the backend of this site. The portfolio
 * has no live API server — instead, a deterministic Python build
 * pipeline compiles Markdown + JSON sources under `content/` into typed
 * static JSON payloads under `frontend/public/data/`. The React app
 * consumes those payloads at runtime through a small set of cached
 * `loadX()` helpers.
 *
 * This page documents:
 *   1. The end-to-end pipeline (sources → schemas → output payloads).
 *   2. Every Python module in `scripts/` and the functions / dataclasses
 *      it exports.
 *   3. Every Pydantic model in `scripts/schemas.py`, paired with its
 *      TypeScript shape in `lib/types.ts` and the JSON endpoint served
 *      from `/data/*.json`.
 *   4. Referential-integrity rules enforced at build time.
 *   5. The frontend data-loading layer (`lib/data.ts`) and the
 *      hooks / helpers that surround it.
 *
 * The page is intentionally static (no MDX runtime) to keep the bundle
 * lean. Tables are pre-declared as typed constants so the documentation
 * tracks the source code via grep-able identifiers.
 */

import { PageHeader } from "../components/PageHeader";

/* ------------------------------------------------------------------ */
/* Schema reference tables                                             */
/* ------------------------------------------------------------------ */

interface FieldRow {
  readonly name: string;
  readonly type: string;
  readonly note?: string;
}

interface SchemaEntry {
  readonly module: string;
  readonly source: string; // Pydantic class location
  readonly tsType: string; // TypeScript interface location
  readonly endpoint: string; // Runtime fetch URL
  readonly bodyField: string | null; // Markdown body slot (if any)
  readonly summary: string;
  readonly fields: ReadonlyArray<FieldRow>;
}

const SCHEMAS: ReadonlyArray<SchemaEntry> = [
  {
    module: "TechStackItem",
    source: "scripts/schemas.py :: TechStackItem",
    tsType: "lib/types.ts :: TechStackItem",
    endpoint: "/data/tech_stack.json",
    bodyField: null,
    summary:
      "A single technology entry (language, framework, or tool). Referenced by stable slug id from jobs, projects, and courses.",
    fields: [
      { name: "id", type: "string", note: "stable slug, referenced as a foreign key" },
      { name: "name", type: "string", note: "human-readable badge label" },
      { name: "logo_url", type: "string | null", note: "legacy /logos/*.svg fallback" },
      {
        name: "category",
        type: '"language" | "framework" | "tool" | null',
        note: "optional grouping for filter UIs",
      },
      { name: "level", type: "number | null", note: "1..5, optional rendering weight" },
    ],
  },
  {
    module: "Degree",
    source: "scripts/schemas.py :: Degree",
    tsType: "lib/types.ts :: Degree",
    endpoint: "/data/degrees.json",
    bodyField: "overview_md",
    summary:
      "An academic credential block rendered on the Academic page. The Markdown body becomes overview_md (raw) and overview_md_html (server-rendered).",
    fields: [
      { name: "id", type: "string" },
      { name: "institution", type: "string" },
      { name: "degree_type", type: "string" },
      { name: "majors", type: "string[]" },
      { name: "concentration", type: "string | null" },
      { name: "start_date", type: "ISO date" },
      { name: "end_date", type: "ISO date | null", note: "null = in progress" },
      { name: "overview_md", type: "string", note: "raw Markdown body" },
      { name: "overview_md_html", type: "string", note: "pre-rendered HTML, build-time" },
    ],
  },
  {
    module: "Course",
    source: "scripts/schemas.py :: Course",
    tsType: "lib/types.ts :: Course",
    endpoint: "/data/courses.json",
    bodyField: "short_description_md",
    summary:
      "A coursework entry tied to a degree via degree_id. The Markdown body is rendered into short_description_md_html at build time.",
    fields: [
      { name: "id", type: "string" },
      { name: "degree_id", type: "string", note: "Degree.id reference (validated)" },
      { name: "name", type: "string" },
      { name: "code", type: "string" },
      { name: "short_description_md", type: "string" },
      { name: "short_description_md_html", type: "string" },
      { name: "tags", type: "string[]" },
    ],
  },
  {
    module: "Job",
    source: "scripts/schemas.py :: Job",
    tsType: "lib/types.ts :: Job",
    endpoint: "/data/jobs.json",
    bodyField: "description_md",
    summary:
      "A professional engagement rendered on the Work page. tech_stack entries are foreign keys into TechStackItem.id and are checked for referential integrity at build time.",
    fields: [
      { name: "id", type: "string" },
      { name: "title", type: "string" },
      { name: "organization", type: "string" },
      { name: "location", type: "string" },
      { name: "start_date", type: "ISO date" },
      { name: "end_date", type: "ISO date | null", note: "null = present" },
      { name: "description_md", type: "string" },
      { name: "description_md_html", type: "string" },
      { name: "tech_stack", type: "string[]", note: "TechStackItem.id refs (validated)" },
    ],
  },
  {
    module: "Project",
    source: "scripts/schemas.py :: Project",
    tsType: "lib/types.ts :: Project",
    endpoint: "/data/projects.json",
    bodyField: "long_description_md",
    summary:
      "A software / research project entry. V2 §3.4 expanded the lifecycle vocabulary (status) and added role / timeframe / tags.",
    fields: [
      { name: "id", type: "string" },
      { name: "title", type: "string" },
      { name: "short_description_md", type: "string" },
      { name: "short_description_md_html", type: "string" },
      { name: "long_description_md", type: "string" },
      { name: "long_description_md_html", type: "string" },
      { name: "tech_stack", type: "string[]", note: "TechStackItem.id refs (validated)" },
      { name: "links", type: "Record<string, string>" },
      {
        name: "status",
        type: '"in_progress" | "completed" | "archived" | "prototype" | "active"',
        note: "default: completed",
      },
      { name: "role", type: "string | null", note: "V2 §3.4" },
      { name: "timeframe", type: "string | null", note: "V2 §3.4" },
      { name: "tags", type: "string[]" },
    ],
  },
  {
    module: "Book",
    source: "scripts/schemas.py :: Book",
    tsType: "lib/types.ts :: Book",
    endpoint: "/data/books.json",
    bodyField: "summary_md",
    summary:
      "A book review record. Canonical fields (title, author, cover_image_url, open_library_key, isbn) are fetched from Open Library by scripts/fetch_books.py. User-annotated fields (rating, category, tags, summary, notes, dates) are authored locally and preserved across re-runs. Per V2 §3.5, rating is nullable so textbooks can be unrated.",
    fields: [
      { name: "id", type: "string" },
      { name: "title", type: "string" },
      { name: "author", type: "string" },
      {
        name: "category",
        type: '"Fiction" | "Nonfiction" | "Textbook"',
        note: "V2 §3.5; legacy 'Learning' retired",
      },
      { name: "rating", type: "number | null", note: "0.00..10.00, rounded to 2dp" },
      { name: "cover_image_url", type: "string | null", note: "Open Library cover URL" },
      { name: "open_library_key", type: "string | null", note: 'e.g. "/works/OL12345W"' },
      { name: "isbn", type: "string | null" },
      { name: "started_at", type: "ISO date | null" },
      { name: "finished_at", type: "ISO date | null" },
      { name: "summary_md", type: "string" },
      { name: "summary_md_html", type: "string" },
      { name: "notes_md", type: "string | null" },
      { name: "notes_md_html", type: "string" },
      { name: "tags", type: "string[]" },
    ],
  },
  {
    module: "Device",
    source: "scripts/schemas.py :: Device",
    tsType: "lib/types.ts :: Device",
    endpoint: "/data/devices.json",
    bodyField: null,
    summary:
      "A capture device used in the Hobbies module. Referenced by Photo.device_id (validated at build time).",
    fields: [
      { name: "id", type: "string" },
      { name: "name", type: "string" },
      { name: "type", type: '"camera" | "phone" | "other"' },
    ],
  },
  {
    module: "Photo",
    source: "scripts/schemas.py :: Photo",
    tsType: "lib/types.ts :: Photo",
    endpoint: "/data/photos.json",
    bodyField: "description_md",
    summary:
      "A photograph asset record consumed by the Hobbies page. The collection may be empty; the device grid above the gallery is the canonical V2 §3.6 layout.",
    fields: [
      { name: "id", type: "string" },
      { name: "image_url", type: "string" },
      { name: "location", type: "string" },
      { name: "year", type: "number", note: "1900..2100" },
      { name: "device_id", type: "string", note: "Device.id ref (validated)" },
      { name: "description_md", type: "string | null" },
      { name: "description_md_html", type: "string" },
      { name: "tags", type: "string[]" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Script reference (scripts/*.py)                                     */
/* ------------------------------------------------------------------ */

interface FnRow {
  readonly name: string;
  readonly signature: string;
  readonly purpose: string;
}

interface ScriptEntry {
  readonly path: string;
  readonly role: string;
  readonly invocation: string;
  readonly notes: string;
  readonly functions: ReadonlyArray<FnRow>;
}

const SCRIPTS: ReadonlyArray<ScriptEntry> = [
  {
    path: "scripts/schemas.py",
    role: "Pydantic source of truth. Every Markdown front-matter or JSON record is validated against one of these models before it can reach the frontend.",
    invocation: "Imported by build_content.py — not executed directly.",
    notes:
      "All models declare model_config = ConfigDict(extra='forbid'), so unknown fields fail loudly. Field-level validators (e.g. Book._round_to_two) enforce numeric invariants. Optional fields default to None so partial front-matter never produces silent false negatives.",
    functions: [
      {
        name: "TechStackItem",
        signature: "class TechStackItem(BaseModel)",
        purpose: "Shared tech badge schema; id is the foreign key across jobs, projects, courses.",
      },
      {
        name: "Degree",
        signature: "class Degree(BaseModel)",
        purpose: "Academic credential; overview_md is filled from the Markdown body.",
      },
      {
        name: "Course",
        signature: "class Course(BaseModel)",
        purpose: "Coursework tied to a degree via degree_id.",
      },
      {
        name: "Job",
        signature: "class Job(BaseModel)",
        purpose: "Work history entry. tech_stack lists TechStackItem.id strings.",
      },
      {
        name: "Project",
        signature: "class Project(BaseModel)",
        purpose: "Software / research project with expanded V2 §3.4 status vocabulary.",
      },
      {
        name: "Book",
        signature: "class Book(BaseModel)",
        purpose:
          "Book review record. _round_to_two enforces two-decimal rating precision; rating is nullable for textbooks.",
      },
      {
        name: "Device",
        signature: "class Device(BaseModel)",
        purpose: "Hobbies-page capture device row.",
      },
      {
        name: "Photo",
        signature: "class Photo(BaseModel)",
        purpose: "Photograph record; year bounded to [1900, 2100].",
      },
    ],
  },
  {
    path: "scripts/build_content.py",
    role: "Compiles structured content into static JSON payloads consumable by the React frontend.",
    invocation:
      ".venv/bin/python scripts/build_content.py — also runs automatically via the npm predev / prebuild hooks defined in frontend/package.json.",
    notes:
      "On the first validation or referential-integrity failure the script writes to stderr and exits with code 1, so it can be wired straight into CI. Markdown bodies are rendered with the 'extra', 'sane_lists', 'smarty', and 'tables' extensions; every *_md field on the output record is mirrored by a *_md_html sibling.",
    functions: [
      {
        name: "render_markdown",
        signature: "render_markdown(text: str) -> str",
        purpose:
          "Render a Markdown string to sanitized HTML using the configured extensions. Empty inputs return an empty string.",
      },
      {
        name: "parse_markdown_file",
        signature:
          "parse_markdown_file(path, model: type[BaseModel], body_field: str) -> dict",
        purpose:
          "Load a .md file with python-frontmatter, inject the body into body_field, validate against model, and attach a rendered *_md_html companion for every *_md key on the record.",
      },
      {
        name: "parse_json_table",
        signature: "parse_json_table(path, model: type[BaseModel]) -> list[dict]",
        purpose:
          "Load and validate a JSON list (used for content/_meta/tech_stack.json and devices.json).",
      },
      {
        name: "collect_markdown_dir",
        signature:
          "collect_markdown_dir(directory, model, body_field) -> list[dict]",
        purpose:
          "Walk a content/<module>/ directory and run parse_markdown_file on each *.md. Files whose stem contains 'placeholder' are skipped to support in-flight refactors.",
      },
      {
        name: "write_json",
        signature: "write_json(name: str, payload: Iterable) -> None",
        purpose:
          "Serialize a payload to frontend/public/data/<name>.json with indent=2 and a default=str fallback for non-JSON-native values (dates).",
      },
      {
        name: "build",
        signature: "build() -> None",
        purpose:
          "Top-level pipeline: load shared tables, walk every Markdown directory, run referential-integrity checks (Course.degree_id, Job/Project.tech_stack[], Photo.device_id), then emit eight JSON payloads.",
      },
    ],
  },
  {
    path: "scripts/fetch_books.py",
    role:
      "Open Library ingestion (V2 §3.5.1). Fetches canonical bibliographic data and merges it with locally authored review fields so the Books page never needs a runtime network call.",
    invocation:
      ".venv/bin/python scripts/fetch_books.py            # fetch + merge\n.venv/bin/python scripts/fetch_books.py --offline   # merge catalog into local files only",
    notes:
      "Open Library Search is a fuzzy index — the first hit ranked by relevance is accepted. The emitted open_library_key allows a human curator to swap in a different /works/OLxxxx key on the next run. Inter-request delay is REQUEST_DELAY_S = 0.5s and the script sends a polite User-Agent header.",
    functions: [
      {
        name: "CatalogEntry",
        signature:
          "@dataclass(frozen=True) class CatalogEntry(title, author, category, rating=None)",
        purpose:
          "Frozen seed row mapping a title/author pair to a user-authored category and rating.",
      },
      {
        name: "CATALOG",
        signature: "CATALOG: tuple[CatalogEntry, ...]",
        purpose:
          "The full reading list; edit this tuple to add or remove books from the build.",
      },
      {
        name: "slugify",
        signature: "slugify(value: str) -> str",
        purpose:
          "Normalize a title into an ASCII, hyphen-separated, filesystem-safe slug used as the book id and filename.",
      },
      {
        name: "search_open_library",
        signature:
          "search_open_library(client: httpx.Client, title, author) -> dict | None",
        purpose:
          "Query Open Library Search with title (+ author hint) and return the first matching doc, or None when no hits are found.",
      },
      {
        name: "doc_to_canonical",
        signature: "doc_to_canonical(doc: dict) -> dict",
        purpose:
          "Project a raw Open Library search doc onto our canonical Book fields (title, author, cover_image_url, open_library_key, isbn).",
      },
      {
        name: "load_existing",
        signature: "load_existing(path: Path) -> tuple[dict, str]",
        purpose:
          "Read an existing book .md file and return (front_matter_dict, body_markdown).",
      },
      {
        name: "merge_entry",
        signature:
          "merge_entry(entry, canonical, existing_meta, existing_body) -> tuple[dict, str]",
        purpose:
          "Apply the conflict policy: canonical bibliographic fields win from the fetch; user-authored fields (rating, category, tags, dates, body Markdown) win from the existing file.",
      },
      {
        name: "_seed_summary",
        signature: "_seed_summary(title: str, author: str) -> str",
        purpose:
          "Generate a placeholder summary body so the build never sees an empty Markdown payload.",
      },
      {
        name: "write_markdown",
        signature: "write_markdown(path, meta: dict, body: str) -> None",
        purpose:
          "Serialize the merged front matter + body back to disk with allow_unicode=True and sort_keys=False.",
      },
      {
        name: "ingest",
        signature: "ingest(entries, offline: bool) -> int",
        purpose:
          "Top-level loop. Online mode opens a shared httpx.Client; offline mode skips all network calls and only merges the catalog into existing files.",
      },
      {
        name: "main",
        signature: "main() -> int",
        purpose: "argparse entry point exposing the --offline flag.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Frontend data layer                                                 */
/* ------------------------------------------------------------------ */

interface LoaderRow {
  readonly name: string;
  readonly signature: string;
  readonly endpoint: string;
  readonly purpose: string;
}

const LOADERS: ReadonlyArray<LoaderRow> = [
  {
    name: "loadTechStack",
    signature: "() => Promise<TechStackItem[]>",
    endpoint: "/data/tech_stack.json",
    purpose: "Resolve every tech badge; cached at module scope after first call.",
  },
  {
    name: "loadDevices",
    signature: "() => Promise<Device[]>",
    endpoint: "/data/devices.json",
    purpose: "Resolve every capture device; consumed by the Hobbies page.",
  },
  {
    name: "loadDegrees",
    signature: "() => Promise<Degree[]>",
    endpoint: "/data/degrees.json",
    purpose: "Resolve every degree record for the Academic timeline.",
  },
  {
    name: "loadCourses",
    signature: "() => Promise<Course[]>",
    endpoint: "/data/courses.json",
    purpose: "Resolve every course row; joined to a degree by degree_id on render.",
  },
  {
    name: "loadJobs",
    signature: "() => Promise<Job[]>",
    endpoint: "/data/jobs.json",
    purpose: "Resolve every job entry for the Work timeline.",
  },
  {
    name: "loadProjects",
    signature: "() => Promise<Project[]>",
    endpoint: "/data/projects.json",
    purpose: "Resolve every project card for the Projects grid.",
  },
  {
    name: "loadBooks",
    signature: "() => Promise<Book[]>",
    endpoint: "/data/books.json",
    purpose: "Resolve every book record for the Books page.",
  },
  {
    name: "loadPhotos",
    signature: "() => Promise<Photo[]>",
    endpoint: "/data/photos.json",
    purpose: "Resolve every photograph; current collection may be empty.",
  },
];

/* ------------------------------------------------------------------ */
/* Frontend utility modules                                            */
/* ------------------------------------------------------------------ */

interface UtilRow {
  readonly path: string;
  readonly export: string;
  readonly purpose: string;
}

const UTILITIES: ReadonlyArray<UtilRow> = [
  {
    path: "lib/data.ts",
    export: "fetchJson<T>(name)",
    purpose:
      "Internal helper behind every loadX() function. Implements a module-level cache plus an in-flight Promise table so concurrent loads of the same endpoint are deduplicated.",
  },
  {
    path: "lib/format.ts",
    export: "formatMonthYear(iso, fallback?)",
    purpose:
      "Format a YYYY-MM-DD string as a human-readable month + year (e.g. 'Aug 2024'). Returns the fallback when iso is null.",
  },
  {
    path: "lib/format.ts",
    export: "formatRating(r, fallback?)",
    purpose:
      "Format a numeric book rating as a two-decimal string. Returns the fallback when r is null (used for unrated textbooks).",
  },
  {
    path: "lib/profile.ts",
    export: "PROFILE",
    purpose:
      "Single source of truth for owner identity: name, bio, email, external links, avatar URL.",
  },
  {
    path: "lib/techIcons.ts",
    export: "TECH_ID_TO_TSI_SLUG, resolveTsiSlug(id)",
    purpose:
      "Map internal TechStackItem.id values to canonical tech-stack-icons slugs (V2 §2.2). resolveTsiSlug returns null when no mapping exists so the TechIcon component can fall back to logo_url then to an accent dot.",
  },
  {
    path: "lib/theme.tsx",
    export: "ThemeProvider, useTheme()",
    purpose:
      "Class-strategy Tailwind dark-mode context, persisted to localStorage and synchronized with the OS preference on first load.",
  },
  {
    path: "lib/hooks/useEvasion.ts",
    export: "useEvasion(opts) -> EvasionState",
    purpose:
      "Cursor-distance physics for the evasive tech-stack bubbles. Implements a smooth radial force f(r) = strength · exp(−r / decay) inside the proximity radius and zero outside.",
  },
  {
    path: "lib/hooks/useFloating.ts",
    export: "useFloating(opts)",
    purpose:
      "Sinusoidal idle motion for tech bubbles (spec §4.4.2). y(t) = amplitude · sin(2π t / period + φ_i) with a small horizontal noise component.",
  },
];

/* ------------------------------------------------------------------ */
/* Build-time referential-integrity rules                              */
/* ------------------------------------------------------------------ */

interface IntegrityRow {
  readonly check: string;
  readonly enforcedIn: string;
  readonly behavior: string;
}

const INTEGRITY: ReadonlyArray<IntegrityRow> = [
  {
    check: "Course.degree_id ∈ {Degree.id}",
    enforcedIn: "scripts/build_content.py :: build()",
    behavior: "Build aborts with a '[ref error]' message naming the offending course id.",
  },
  {
    check: "Job.tech_stack[*] ∈ {TechStackItem.id}",
    enforcedIn: "scripts/build_content.py :: build()",
    behavior: "Build aborts naming the job and the unknown tech id.",
  },
  {
    check: "Project.tech_stack[*] ∈ {TechStackItem.id}",
    enforcedIn: "scripts/build_content.py :: build()",
    behavior: "Build aborts naming the project and the unknown tech id.",
  },
  {
    check: "Photo.device_id ∈ {Device.id}",
    enforcedIn: "scripts/build_content.py :: build()",
    behavior: "Build aborts naming the photo and the unknown device id.",
  },
  {
    check: "Front-matter conforms to the Pydantic model (extra='forbid')",
    enforcedIn: "scripts/schemas.py + parse_markdown_file()",
    behavior:
      "ValidationError is printed to stderr with the offending file path, then SystemExit(1).",
  },
  {
    check: "Book.rating ∈ [0.0, 10.0] and rounded to 2dp",
    enforcedIn: "scripts/schemas.py :: Book._round_to_two",
    behavior: "Field-level validator coerces precision; out-of-range values fail validation.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function ApiDocs(): JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <PageHeader
        eyebrow="Reference"
        title="Backend architecture and content API"
        subtitle="A complete tour of the build pipeline: every Python script, every Pydantic schema, every JSON endpoint served from /data/*.json, and the frontend loaders that consume them."
      />

      {/* Architecture overview ----------------------------------------- */}
      <article className="mb-10 rounded-xl border border-ink-200 bg-ink-50 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800">
        <h2 className="mb-3 font-display text-xl font-semibold text-ink-700 dark:text-ink-50">
          Pipeline overview
        </h2>
        <p className="mb-3 text-sm text-ink-600 dark:text-ink-300">
          This site has no live API server. A deterministic Python build
          compiles structured content into static JSON, the React app
          fetches each payload once per session, and a module-level cache
          plus in-flight Promise table deduplicates concurrent loads.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-ink-900/90 p-4 text-xs leading-relaxed text-ink-50 dark:bg-ink-900">
{`content/                          frontend/public/data/        frontend/src/
├── _meta/                        ├── tech_stack.json          ├── lib/data.ts
│   ├── tech_stack.json   ──┐    ├── devices.json             │   loadTechStack()
│   └── devices.json       │    ├── degrees.json              │   loadDevices()
├── degrees/*.md           │    ├── courses.json              │   loadDegrees()
├── courses/*.md           │──> ├── jobs.json          ─────> │   loadCourses()
├── jobs/*.md              │    ├── projects.json             │   loadJobs()
├── projects/*.md          │    ├── books.json                │   loadProjects()
├── books/*.md             │    └── photos.json               │   loadBooks()
└── photos/*.md (optional) ┘                                  │   loadPhotos()
                                                              │
              scripts/schemas.py            scripts/build_content.py
              (Pydantic models)             (validate + render → JSON)

              scripts/fetch_books.py
              (Open Library → content/books/*.md)`}
        </pre>
        <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">
          The build is wired to npm via{" "}
          <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-xs text-ink-700 dark:bg-ink-900 dark:text-ink-200">
            predev
          </code>{" "}
          and{" "}
          <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-xs text-ink-700 dark:bg-ink-900 dark:text-ink-200">
            prebuild
          </code>{" "}
          hooks in <code className="font-mono">frontend/package.json</code>,
          so <code className="font-mono">npm run dev</code> and{" "}
          <code className="font-mono">npm run build</code> always rebuild
          the JSON payloads first.
        </p>
      </article>

      {/* Scripts -------------------------------------------------------- */}
      <h2 className="mb-4 font-display text-2xl font-semibold text-ink-700 dark:text-ink-50">
        Backend scripts
      </h2>
      <div className="mb-12 space-y-6">
        {SCRIPTS.map((s) => (
          <article
            key={s.path}
            className="rounded-xl border border-ink-200 bg-ink-50 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800"
          >
            <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-mono text-base font-semibold text-ink-700 dark:text-ink-50">
                {s.path}
              </h3>
            </header>
            <p className="mb-3 text-sm text-ink-600 dark:text-ink-300">
              {s.role}
            </p>
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-400">
              Invocation
            </p>
            <pre className="mb-3 overflow-x-auto rounded-md bg-ink-900/90 p-3 text-xs text-ink-50 dark:bg-ink-900">
              {s.invocation}
            </pre>
            <p className="mb-4 text-xs text-ink-500 dark:text-ink-400">
              {s.notes}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs font-medium uppercase tracking-widest text-ink-400">
                  <tr>
                    <th className="py-2 pr-4">Symbol</th>
                    <th className="py-2 pr-4">Signature</th>
                    <th className="py-2">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {s.functions.map((f) => (
                    <tr
                      key={f.name}
                      className="border-t border-ink-200/50 align-top dark:border-ink-700/50"
                    >
                      <td className="py-2 pr-4 font-mono text-xs text-ink-700 dark:text-ink-100">
                        {f.name}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-ink-500 dark:text-ink-300">
                        {f.signature}
                      </td>
                      <td className="py-2 text-xs text-ink-500 dark:text-ink-300">
                        {f.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>

      {/* Schemas -------------------------------------------------------- */}
      <h2 className="mb-4 font-display text-2xl font-semibold text-ink-700 dark:text-ink-50">
        Content schemas and JSON endpoints
      </h2>
      <div className="mb-12 space-y-8">
        {SCHEMAS.map((s) => (
          <article
            key={s.module}
            className="rounded-xl border border-ink-200 bg-ink-50 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800"
          >
            <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-xl font-semibold text-ink-700 dark:text-ink-50">
                {s.module}
              </h3>
              <code className="rounded-md bg-ink-100 px-2 py-0.5 font-mono text-xs text-ink-600 dark:bg-ink-900/70 dark:text-ink-200">
                GET {s.endpoint}
              </code>
            </header>
            <p className="mb-3 text-sm text-ink-600 dark:text-ink-300">
              {s.summary}
            </p>
            <ul className="mb-4 grid grid-cols-1 gap-1 text-xs text-ink-500 dark:text-ink-400 sm:grid-cols-2">
              <li>
                <span className="font-medium uppercase tracking-widest text-ink-400">
                  Source:
                </span>{" "}
                <code className="font-mono">{s.source}</code>
              </li>
              <li>
                <span className="font-medium uppercase tracking-widest text-ink-400">
                  Frontend type:
                </span>{" "}
                <code className="font-mono">{s.tsType}</code>
              </li>
              {s.bodyField && (
                <li className="sm:col-span-2">
                  <span className="font-medium uppercase tracking-widest text-ink-400">
                    Markdown body slot:
                  </span>{" "}
                  <code className="font-mono">{s.bodyField}</code> (rendered
                  to <code className="font-mono">{s.bodyField}_html</code> at
                  build time)
                </li>
              )}
            </ul>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs font-medium uppercase tracking-widest text-ink-400">
                  <tr>
                    <th className="py-2 pr-4">Field</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {s.fields.map((f) => (
                    <tr
                      key={f.name}
                      className="border-t border-ink-200/50 align-top dark:border-ink-700/50"
                    >
                      <td className="py-2 pr-4 font-mono text-xs text-ink-700 dark:text-ink-100">
                        {f.name}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-ink-500 dark:text-ink-300">
                        {f.type}
                      </td>
                      <td className="py-2 text-xs text-ink-400">
                        {f.note ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>

      {/* Referential integrity ----------------------------------------- */}
      <h2 className="mb-4 font-display text-2xl font-semibold text-ink-700 dark:text-ink-50">
        Referential-integrity rules
      </h2>
      <article className="mb-12 overflow-x-auto rounded-xl border border-ink-200 bg-ink-50 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800">
        <table className="w-full text-left text-sm">
          <thead className="text-xs font-medium uppercase tracking-widest text-ink-400">
            <tr>
              <th className="py-2 pr-4">Check</th>
              <th className="py-2 pr-4">Enforced in</th>
              <th className="py-2">Failure behavior</th>
            </tr>
          </thead>
          <tbody>
            {INTEGRITY.map((row) => (
              <tr
                key={row.check}
                className="border-t border-ink-200/50 align-top dark:border-ink-700/50"
              >
                <td className="py-2 pr-4 font-mono text-xs text-ink-700 dark:text-ink-100">
                  {row.check}
                </td>
                <td className="py-2 pr-4 font-mono text-xs text-ink-500 dark:text-ink-300">
                  {row.enforcedIn}
                </td>
                <td className="py-2 text-xs text-ink-500 dark:text-ink-300">
                  {row.behavior}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      {/* Frontend data loaders ----------------------------------------- */}
      <h2 className="mb-4 font-display text-2xl font-semibold text-ink-700 dark:text-ink-50">
        Frontend data loaders
      </h2>
      <article className="mb-12 rounded-xl border border-ink-200 bg-ink-50 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800">
        <p className="mb-3 text-sm text-ink-600 dark:text-ink-300">
          All loaders live in{" "}
          <code className="font-mono">frontend/src/lib/data.ts</code>. Each
          one is a thin wrapper around{" "}
          <code className="font-mono">fetchJson&lt;T&gt;(name)</code>, which
          maintains a module-level cache keyed by endpoint name and a
          parallel <code className="font-mono">inflight</code> Promise table
          so concurrent calls share a single network request.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-medium uppercase tracking-widest text-ink-400">
              <tr>
                <th className="py-2 pr-4">Function</th>
                <th className="py-2 pr-4">Signature</th>
                <th className="py-2 pr-4">Endpoint</th>
                <th className="py-2">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {LOADERS.map((l) => (
                <tr
                  key={l.name}
                  className="border-t border-ink-200/50 align-top dark:border-ink-700/50"
                >
                  <td className="py-2 pr-4 font-mono text-xs text-ink-700 dark:text-ink-100">
                    {l.name}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-ink-500 dark:text-ink-300">
                    {l.signature}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-ink-500 dark:text-ink-300">
                    {l.endpoint}
                  </td>
                  <td className="py-2 text-xs text-ink-500 dark:text-ink-300">
                    {l.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* Frontend utility modules -------------------------------------- */}
      <h2 className="mb-4 font-display text-2xl font-semibold text-ink-700 dark:text-ink-50">
        Frontend utility modules
      </h2>
      <article className="mb-12 overflow-x-auto rounded-xl border border-ink-200 bg-ink-50 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800">
        <table className="w-full text-left text-sm">
          <thead className="text-xs font-medium uppercase tracking-widest text-ink-400">
            <tr>
              <th className="py-2 pr-4">Module</th>
              <th className="py-2 pr-4">Export</th>
              <th className="py-2">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {UTILITIES.map((u) => (
              <tr
                key={u.path + u.export}
                className="border-t border-ink-200/50 align-top dark:border-ink-700/50"
              >
                <td className="py-2 pr-4 font-mono text-xs text-ink-700 dark:text-ink-100">
                  {u.path}
                </td>
                <td className="py-2 pr-4 font-mono text-xs text-ink-500 dark:text-ink-300">
                  {u.export}
                </td>
                <td className="py-2 text-xs text-ink-500 dark:text-ink-300">
                  {u.purpose}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
