/**
 * Books page — spec §4.6 + V2 §3.5.
 *
 * Toolbar: description header, [Fiction] [Nonfiction] [Textbook] filter
 * chips, and a sorting dropdown (rating | finished_at | alphabetical).
 * The legacy "Learning" bucket was retired in V2 §3.5 in favor of the
 * narrower "Textbook" category.
 *
 * Shelf grid: thumbnail cover + title + author. Hovering a card reveals an
 * overlay score badge (0.00–10.00). Clicking opens a modal with summary and
 * notes, complete date scopes. Textbooks may carry a null rating, in which
 * case the overlay badge is suppressed and the card sorts to the end under
 * rating-desc.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Book, BookCategory } from "../lib/types";
import { loadBooks } from "../lib/data";
import { Markdown } from "../components/Markdown";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { FilterChip } from "../components/FilterChip";
import { SortDropdown } from "../components/SortDropdown";
import { formatMonthYear, formatRating } from "../lib/format";

type SortKey = "rating" | "finished" | "alpha";

const SORT_OPTIONS = [
  { value: "rating", label: "Rating (high → low)" },
  { value: "finished", label: "Finished date" },
  { value: "alpha", label: "Alphabetical" },
] as const satisfies ReadonlyArray<{ value: SortKey; label: string }>;

// V2 §3.5.2: filter order is Fiction → Nonfiction → Textbook
// ("Learning" was replaced wholesale by "Textbook").
const CATEGORIES: ReadonlyArray<BookCategory> = [
  "Fiction",
  "Nonfiction",
  "Textbook",
];

export function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [active, setActive] = useState<Book | null>(null);
  const [cats, setCats] = useState<Set<BookCategory>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("rating");

  useEffect(() => {
    loadBooks().then(setBooks);
  }, []);

  const countsByCategory = useMemo(() => {
    const m = new Map<BookCategory, number>();
    books.forEach((b) => m.set(b.category, (m.get(b.category) ?? 0) + 1));
    return m;
  }, [books]);

  const filtered = useMemo(() => {
    const filtered = books.filter(
      (b) => cats.size === 0 || cats.has(b.category),
    );
    // V2 §3.5: textbooks may have null ratings; treat null as -Infinity
    // so unrated entries sort to the bottom under rating-desc.
    const r = (b: Book): number =>
      b.rating === null ? Number.NEGATIVE_INFINITY : b.rating;
    const cmp: Record<SortKey, (a: Book, b: Book) => number> = {
      rating: (a, b) => r(b) - r(a),
      finished: (a, b) =>
        (b.finished_at ?? "0000").localeCompare(a.finished_at ?? "0000"),
      alpha: (a, b) => a.title.localeCompare(b.title),
    };
    return [...filtered].sort(cmp[sortKey]);
  }, [books, cats, sortKey]);

  const toggleCat = (c: BookCategory) => {
    setCats((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <PageHeader
        eyebrow="Books"
        title="Reading log"
        subtitle="Annual reading targets, active study focuses, and per-book ratings on the 0.00–10.00 scale. Hover a cover for the score; click to read the summary and notes."
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-ink-200/60 pb-4 dark:border-ink-700/60">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              label={c}
              count={countsByCategory.get(c) ?? 0}
              active={cats.has(c)}
              onToggle={() => toggleCat(c)}
            />
          ))}
          {cats.size > 0 && (
            <button
              type="button"
              onClick={() => setCats(new Set())}
              className="ml-1 text-xs text-ink-500 underline-offset-2 hover:underline dark:text-ink-400"
            >
              Clear
            </button>
          )}
        </div>
        <SortDropdown
          value={sortKey}
          options={SORT_OPTIONS}
          onChange={(v) => setSortKey(v)}
        />
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((b) => (
          <li key={b.id}>
            <BookCard book={b} onOpen={() => setActive(b)} />
          </li>
        ))}
      </ul>

      <Modal
        open={active !== null}
        title={active?.title ?? ""}
        onClose={() => setActive(null)}
      >
        {active && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink-500 dark:text-ink-400">
              {active.author} &middot; {active.category}
              {active.rating !== null && (
                <>
                  {" "}
                  &middot; Rating{" "}
                  <strong className="text-ink-700 dark:text-ink-50">
                    {formatRating(active.rating)}
                  </strong>
                </>
              )}
            </p>
            <p className="text-xs text-ink-400">
              {formatMonthYear(active.started_at, "Not started")} &mdash;{" "}
              {formatMonthYear(active.finished_at, "In progress")}
            </p>
            <section>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-400">
                Summary
              </h3>
              <Markdown html={active.summary_md_html} />
            </section>
            {active.notes_md_html && (
              <section>
                <h3 className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-400">
                  Notes
                </h3>
                <Markdown html={active.notes_md_html} />
              </section>
            )}
            {active.tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {active.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] text-ink-500 dark:bg-ink-700 dark:text-ink-300"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}

/* ------------------------------ Book card ------------------------------ */

interface CardProps {
  book: Book;
  onOpen: () => void;
}

function BookCard({ book, onOpen }: CardProps) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover="hover"
      initial="rest"
      animate="rest"
      className="group relative block w-full overflow-hidden rounded-xl border border-ink-200 bg-ink-50 text-left shadow-sm transition-shadow duration-200 hover:shadow-md focus:outline-none focus-visible:border-accent dark:border-ink-700 dark:bg-ink-800"
      aria-haspopup="dialog"
      aria-label={
        book.rating !== null
          ? `${book.title} by ${book.author}. Rating ${formatRating(
              book.rating,
            )} out of 10. Open summary.`
          : `${book.title} by ${book.author}. Open summary.`
      }
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-ink-100 dark:bg-ink-700">
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={`Cover of ${book.title}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-ink-400">
            {book.title}
          </div>
        )}
        {book.rating !== null && (
          <motion.span
            variants={{
              rest: { opacity: 0, y: 6 },
              hover: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute right-2 top-2 rounded-full bg-ink-900/80 px-2 py-0.5 text-xs font-medium text-ink-50 backdrop-blur-sm"
            aria-hidden
          >
            {formatRating(book.rating)}
          </motion.span>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="line-clamp-2 text-sm font-medium text-ink-700 dark:text-ink-50">
          {book.title}
        </p>
        <p className="mt-0.5 text-xs text-ink-400">{book.author}</p>
      </div>
    </motion.button>
  );
}
