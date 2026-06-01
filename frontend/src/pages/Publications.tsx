/**
 * Publications page — research output (preprints + peer-reviewed articles).
 *
 * Sits immediately after Academic in the primary navigation. Each record is a
 * card carrying the title, an ordered author byline (the site owner is bolded
 * and every author with an ORCID iD links out), the venue + posting date, a
 * resolved DOI link, and topical tags. Clicking a card opens a modal with the
 * full abstract (server-pre-rendered Markdown).
 *
 * Interaction language mirrors Books / Academic:
 *   - status filter chips narrow the list (preprint / published / ...).
 *   - a sort dropdown orders by date or title.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Author, Publication, PublicationStatus } from "../lib/types";
import { loadPublications } from "../lib/data";
import { PROFILE } from "../lib/profile";
import { Markdown } from "../components/Markdown";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { FilterChip } from "../components/FilterChip";
import { SortDropdown, type SortOption } from "../components/SortDropdown";
import { formatMonthYear } from "../lib/format";

/** Human-readable label for each lifecycle stage. */
const STATUS_LABEL: Record<PublicationStatus, string> = {
  preprint: "Preprint",
  published: "Published",
  under_review: "Under review",
  in_preparation: "In preparation",
};

/**
 * Tailwind badge palette per status. Preprints and published work read as the
 * two dominant states, so they get the warm / emerald accents; the in-progress
 * states stay muted.
 */
const STATUS_BADGE: Record<PublicationStatus, string> = {
  published:
    "border-emerald-400/40 bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  preprint:
    "border-amber-400/40 bg-amber-300/15 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300",
  under_review:
    "border-sky-400/40 bg-sky-400/15 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300",
  in_preparation:
    "border-ink-300/50 bg-ink-200/40 text-ink-600 dark:border-ink-600/60 dark:bg-ink-700/40 dark:text-ink-300",
};

type SortKey = "date_desc" | "date_asc" | "title";

const SORT_OPTIONS: ReadonlyArray<SortOption<SortKey>> = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "title", label: "Title (A–Z)" },
];

/** Sort epoch fallback so records without a date sink to the bottom. */
function dateValue(p: Publication): number {
  return p.published_date ? Date.parse(p.published_date) : 0;
}

/** Resolve the canonical external link for a publication: explicit url > DOI. */
function primaryUrl(p: Publication): string | null {
  if (p.url) return p.url;
  if (p.doi) return `https://doi.org/${p.doi}`;
  return null;
}

export function Publications() {
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [activeStatuses, setActiveStatuses] = useState<Set<PublicationStatus>>(
    new Set(),
  );
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [open, setOpen] = useState<Publication | null>(null);

  useEffect(() => {
    loadPublications().then(setPubs);
  }, []);

  // Aggregate status counts for the filter chip row, preserving a stable order.
  const statusCounts = useMemo(() => {
    const order: PublicationStatus[] = [
      "preprint",
      "published",
      "under_review",
      "in_preparation",
    ];
    const m = new Map<PublicationStatus, number>();
    pubs.forEach((p) => m.set(p.status, (m.get(p.status) ?? 0) + 1));
    return order
      .filter((s) => m.has(s))
      .map((s) => [s, m.get(s) as number] as const);
  }, [pubs]);

  const toggleStatus = (s: PublicationStatus) =>
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });

  const visible = useMemo(() => {
    const filtered = pubs.filter(
      (p) => activeStatuses.size === 0 || activeStatuses.has(p.status),
    );
    const cmp: Record<SortKey, (a: Publication, b: Publication) => number> = {
      date_desc: (a, b) => dateValue(b) - dateValue(a),
      date_asc: (a, b) => dateValue(a) - dateValue(b),
      title: (a, b) => a.title.localeCompare(b.title),
    };
    return [...filtered].sort(cmp[sort]);
  }, [pubs, activeStatuses, sort]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <PageHeader
        eyebrow="Publications"
        title="Research output"
        subtitle="Preprints and peer-reviewed articles, newest first. Each entry links to its DOI and per-author ORCID profiles; open a card to read the full abstract."
      />

      {/* Controls — status filter + sort. */}
      {pubs.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-widest text-ink-400">
              Filter
            </span>
            {statusCounts.map(([status, count]) => (
              <FilterChip
                key={status}
                label={STATUS_LABEL[status]}
                count={count}
                active={activeStatuses.has(status)}
                onToggle={() => toggleStatus(status)}
              />
            ))}
            {activeStatuses.size > 0 && (
              <button
                type="button"
                onClick={() => setActiveStatuses(new Set())}
                className="ml-1 text-xs text-ink-500 underline-offset-2 hover:underline dark:text-ink-400"
              >
                Clear
              </button>
            )}
          </div>
          <SortDropdown
            value={sort}
            options={SORT_OPTIONS}
            onChange={setSort}
            id="publications-sort"
          />
        </div>
      )}

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-200 px-6 py-10 text-center text-sm text-ink-400 dark:border-ink-700">
          No publications match the current filter.
        </p>
      ) : (
        <ol className="space-y-5">
          {visible.map((p) => (
            <li key={p.id}>
              <PublicationCard pub={p} onOpen={() => setOpen(p)} />
            </li>
          ))}
        </ol>
      )}

      {/* Abstract modal. */}
      <Modal
        open={open !== null}
        title={open?.title ?? ""}
        onClose={() => setOpen(null)}
      >
        {open && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500 dark:text-ink-400">
              <AuthorList authors={open.authors} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
              <span>
                {open.venue}
                {open.published_date
                  ? ` · ${formatMonthYear(open.published_date)}`
                  : ""}
              </span>
              {primaryUrl(open) && (
                <a
                  href={primaryUrl(open) as string}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  {open.doi ? `doi:${open.doi}` : "View publication"}
                </a>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-400">
                Abstract
              </h3>
              <Markdown html={open.abstract_md_html} />
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

/* --------------------------- Publication card --------------------------- */

interface CardProps {
  pub: Publication;
  onOpen: () => void;
}

function PublicationCard({ pub, onOpen }: CardProps) {
  const url = primaryUrl(pub);
  return (
    <motion.article
      initial={{ y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="rounded-xl border border-ink-200 bg-ink-50 p-6 shadow-sm transition-shadow duration-200 ease-apple hover:shadow-md dark:border-ink-700 dark:bg-ink-800"
    >
      <header className="mb-2 flex items-start justify-between gap-4">
        <h2 className="min-w-0 flex-1 font-display text-lg font-semibold text-ink-700 dark:text-ink-50">
          <button
            type="button"
            onClick={onOpen}
            className="text-left transition-colors hover:text-accent focus:outline-none focus-visible:underline"
            aria-haspopup="dialog"
          >
            {pub.title}
          </button>
        </h2>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${STATUS_BADGE[pub.status]}`}
        >
          {STATUS_LABEL[pub.status]}
        </span>
      </header>

      <p className="text-sm text-ink-500 dark:text-ink-400">
        <AuthorList authors={pub.authors} />
      </p>

      <p className="mt-1.5 text-xs text-ink-400">
        {pub.venue}
        {pub.published_date ? ` · ${formatMonthYear(pub.published_date)}` : ""}
      </p>

      {pub.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {pub.tags.map((t) => (
            <li
              key={t}
              className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] text-ink-500 dark:bg-ink-700 dark:text-ink-300"
            >
              {t}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        <button
          type="button"
          onClick={onOpen}
          className="font-medium text-accent underline-offset-2 hover:underline"
          aria-haspopup="dialog"
        >
          Read abstract
        </button>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-ink-500 underline-offset-2 hover:text-accent hover:underline dark:text-ink-400"
          >
            {pub.doi ? `doi:${pub.doi}` : "View publication"}
          </a>
        )}
        {Object.entries(pub.links).map(([label, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-ink-500 underline-offset-2 hover:text-accent hover:underline dark:text-ink-400"
          >
            {label}
          </a>
        ))}
      </div>
    </motion.article>
  );
}

/* ----------------------------- Author list ----------------------------- */

/**
 * Render an ordered author byline. The site owner (matched against
 * PROFILE.name) is bolded; any author with an ORCID iD links to their profile.
 */
function AuthorList({ authors }: { authors: Author[] }) {
  return (
    <span>
      {authors.map((a, i) => {
        const isOwner = a.name === PROFILE.name;
        const sep = i < authors.length - 1 ? ", " : "";
        const nameNode = a.orcid ? (
          <a
            href={`https://orcid.org/${a.orcid}`}
            target="_blank"
            rel="noreferrer noopener"
            className={`underline-offset-2 hover:text-accent hover:underline ${
              isOwner ? "font-semibold text-ink-700 dark:text-ink-100" : ""
            }`}
            title={`ORCID ${a.orcid}`}
          >
            {a.name}
          </a>
        ) : (
          <span
            className={
              isOwner ? "font-semibold text-ink-700 dark:text-ink-100" : ""
            }
          >
            {a.name}
          </span>
        );
        return (
          <span key={`${a.name}-${i}`}>
            {nameNode}
            {sep}
          </span>
        );
      })}
    </span>
  );
}
