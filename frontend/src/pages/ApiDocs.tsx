/**
 * ApiDocs page (V2 §2.1).
 *
 * Documents the content-pipeline schemas exposed by the static JSON
 * payloads under `/public/data/`. Each section maps a Pydantic model
 * from `scripts/schemas.py` to its TypeScript shape in `lib/types.ts`
 * and lists the JSON endpoint consumed at runtime.
 *
 * The page is intentionally static (no MDX runtime) to keep the bundle
 * lean. Future revisions can swap in `react-syntax-highlighter` or
 * shiki for richer code rendering.
 */

import { PageHeader } from "../components/PageHeader";

interface SchemaEntry {
  readonly module: string;
  readonly endpoint: string;
  readonly fields: ReadonlyArray<{ name: string; type: string; note?: string }>;
}

const SCHEMAS: ReadonlyArray<SchemaEntry> = [
  {
    module: "TechStackItem",
    endpoint: "/data/tech_stack.json",
    fields: [
      { name: "id", type: "string", note: "stable slug" },
      { name: "name", type: "string" },
      { name: "logo_url", type: "string | null", note: "legacy fallback" },
      {
        name: "category",
        type: '"language" | "framework" | "tool" | null',
      },
      { name: "level", type: "number | null", note: "1..5" },
    ],
  },
  {
    module: "Degree",
    endpoint: "/data/degrees.json",
    fields: [
      { name: "id", type: "string" },
      { name: "institution", type: "string" },
      { name: "degree_type", type: "string" },
      { name: "majors", type: "string[]" },
      { name: "concentration", type: "string | null" },
      { name: "start_date", type: "ISO date" },
      { name: "end_date", type: "ISO date | null", note: "null = in progress" },
      { name: "overview_md_html", type: "string", note: "pre-rendered" },
    ],
  },
  {
    module: "Course",
    endpoint: "/data/courses.json",
    fields: [
      { name: "id", type: "string" },
      { name: "degree_id", type: "string" },
      { name: "name", type: "string" },
      { name: "code", type: "string" },
      { name: "short_description_md_html", type: "string" },
      { name: "tags", type: "string[]" },
    ],
  },
  {
    module: "Job",
    endpoint: "/data/jobs.json",
    fields: [
      { name: "id", type: "string" },
      { name: "title", type: "string" },
      { name: "organization", type: "string" },
      { name: "location", type: "string" },
      { name: "start_date", type: "ISO date" },
      { name: "end_date", type: "ISO date | null", note: "null = present" },
      { name: "description_md_html", type: "string" },
      { name: "tech_stack", type: "string[]", note: "TechStackItem.id refs" },
    ],
  },
  {
    module: "Project",
    endpoint: "/data/projects.json",
    fields: [
      { name: "id", type: "string" },
      { name: "title", type: "string" },
      { name: "role", type: "string", note: "V2 §3.4" },
      { name: "timeframe", type: "string | null" },
      { name: "tech_stack", type: "string[]" },
      { name: "links", type: "Record<string, string>" },
      {
        name: "status",
        type: '"in_progress" | "completed" | "archived" | "prototype" | "experimental"',
      },
      { name: "tags", type: "string[]" },
    ],
  },
  {
    module: "Book",
    endpoint: "/data/books.json",
    fields: [
      { name: "id", type: "string" },
      { name: "title", type: "string" },
      { name: "author", type: "string" },
      {
        name: "category",
        type: '"Fiction" | "Nonfiction" | "Textbook"',
        note: "V2 §3.5",
      },
      { name: "rating", type: "number", note: "0..10, optional for textbooks" },
      { name: "cover_image_url", type: "string | null" },
      { name: "summary_md_html", type: "string" },
      { name: "notes_md_html", type: "string" },
      { name: "tags", type: "string[]" },
    ],
  },
  {
    module: "Device",
    endpoint: "/data/devices.json",
    fields: [
      { name: "id", type: "string" },
      { name: "name", type: "string" },
      { name: "type", type: '"camera" | "phone" | "other"' },
    ],
  },
  {
    module: "Photo",
    endpoint: "/data/photos.json",
    fields: [
      { name: "id", type: "string" },
      { name: "image_url", type: "string" },
      { name: "location", type: "string" },
      { name: "year", type: "number" },
      { name: "device_id", type: "string", note: "Device.id ref" },
      { name: "description_md_html", type: "string" },
      { name: "tags", type: "string[]" },
    ],
  },
];

export function ApiDocs(): JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <PageHeader
        eyebrow="Reference"
        title="API and content schemas"
        subtitle="Every payload served from /public/data/*.json, paired with its source Pydantic model in scripts/schemas.py and TypeScript shape in lib/types.ts."
      />

      <div className="space-y-10">
        {SCHEMAS.map((s) => (
          <article
            key={s.module}
            className="rounded-xl border border-ink-200 bg-ink-50 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800"
          >
            <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-xl font-semibold text-ink-700 dark:text-ink-50">
                {s.module}
              </h2>
              <code className="rounded-md bg-ink-100 px-2 py-0.5 font-mono text-xs text-ink-600 dark:bg-ink-900/70 dark:text-ink-200">
                GET {s.endpoint}
              </code>
            </header>
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
                      className="border-t border-ink-200/50 dark:border-ink-700/50"
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
    </section>
  );
}
