/**
 * Academic page — spec §4.3 + V2 §3.2.
 *
 * - Graduate and undergraduate degree blocks rendered as a vertical timeline.
 * - Each block carries an overview (rendered Markdown) plus a coursework grid.
 * - Course cells reveal an animated tooltip on hover with description + tags.
 * - Filter chips at the page header parse coursework by tag.
 *
 * V2 §3.2 additions:
 *   - Diploma launch button at the top-right of each degree card.
 *     - Undergraduate: opens a modal streaming /msu_diploma.pdf via <iframe>.
 *     - Graduate: renders a static yellow "In Progress" pill instead.
 *   - "Coursework" button on the undergraduate card opens the
 *     TranscriptFlowchart modal (vertical year/semester layout with a GPA
 *     metrics block top-right).
 */

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Course, Degree } from "../lib/types";
import { loadCourses, loadDegrees } from "../lib/data";
import { Markdown } from "../components/Markdown";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { FilterChip } from "../components/FilterChip";
import { TranscriptFlowchart } from "../components/TranscriptFlowchart";
import { formatMonthYear } from "../lib/format";

/**
 * Modal selector. A degree card opens exactly one of:
 *   - "diploma" : iframe of the PDF asset under /public.
 *   - "transcript" : <TranscriptFlowchart /> body.
 *   - null : no modal open.
 */
type AcademicModal =
  | { kind: "diploma"; pdfPath: string; title: string }
  | { kind: "transcript" }
  | null;

/**
 * Heuristic: a degree is "in progress" iff its `end_date` is null
 * (matches the Pydantic Degree schema convention).
 */
function isInProgress(deg: Degree): boolean {
  return deg.end_date === null;
}

export function Academic() {
  const [modal, setModal] = useState<AcademicModal>(null);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([loadDegrees(), loadCourses()]).then(([d, c]) => {
      setDegrees(d);
      setCourses(c);
    });
  }, []);

  // Aggregate unique tags + counts for the filter chip row.
  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    courses.forEach((c) =>
      c.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)),
    );
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [courses]);

  const toggleTag = (t: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const filterCourse = (c: Course): boolean =>
    activeTags.size === 0 || c.tags.some((t) => activeTags.has(t));

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <PageHeader
        eyebrow="Academic"
        title="Institutional credentials and coursework"
        subtitle="A vertical timeline of degree blocks. Each block carries an overview, structured majors and concentration, and a grid of courses with hover-revealed descriptions."
      />

      {tagCounts.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-widest text-ink-400">
            Filter
          </span>
          {tagCounts.map(([tag, count]) => (
            <FilterChip
              key={tag}
              label={tag}
              count={count}
              active={activeTags.has(tag)}
              onToggle={() => toggleTag(tag)}
            />
          ))}
          {activeTags.size > 0 && (
            <button
              type="button"
              onClick={() => setActiveTags(new Set())}
              className="ml-2 text-xs text-ink-500 underline-offset-2 hover:underline dark:text-ink-400"
            >
              Clear
            </button>
          )}
        </div>
      )}

      <ol className="relative space-y-12 border-l border-ink-200 pl-6 dark:border-ink-700">
        {degrees.map((deg) => {
          const degreeCourses = courses
            .filter((c) => c.degree_id === deg.id)
            .filter(filterCourse);
          return (
            <li key={deg.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-ink-50 dark:bg-ink-900"
              />
              <article className="rounded-xl border border-ink-200 bg-ink-50 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800">
                <header className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-widest text-accent">
                      {deg.degree_type} &middot; {deg.institution}
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-ink-700 dark:text-ink-50">
                      {deg.majors.join(" + ")}
                      {deg.concentration ? (
                        <span className="ml-2 text-base font-normal text-ink-500 dark:text-ink-400">
                          ({deg.concentration})
                        </span>
                      ) : null}
                    </h2>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                      {formatMonthYear(deg.start_date)} &mdash;{" "}
                      {formatMonthYear(deg.end_date)}
                    </p>
                  </div>

                  {/* Top-right credential cluster (V2 §3.2) */}
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {isInProgress(deg) ? (
                      <span
                        role="status"
                        className="rounded-full border border-yellow-400/40 bg-yellow-300/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-yellow-700 dark:bg-yellow-300/10 dark:text-yellow-300"
                      >
                        In Progress
                      </span>
                    ) : (
                      <>
                        <span
                          role="status"
                          className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        >
                          Graduated
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setModal({
                              kind: "diploma",
                              pdfPath: "/msu_diploma.pdf",
                              title: `${deg.degree_type} diploma — ${deg.institution}`,
                            })
                          }
                          className="rounded-md border border-ink-200 px-3 py-1 text-xs font-medium text-ink-600 transition-colors hover:border-accent hover:text-accent dark:border-ink-700 dark:text-ink-200 dark:hover:border-accent"
                          aria-label={`View ${deg.degree_type} diploma`}
                        >
                          View diploma
                        </button>
                      </>
                    )}
                  </div>
                </header>

                <Markdown html={deg.overview_md_html} />

                {degreeCourses.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center gap-3">
                      <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
                        Relevant Coursework
                      </h3>
                      {deg.id === "msu-denver-bs" && (
                        <button
                          type="button"
                          onClick={() => setModal({ kind: "transcript" })}
                          className="rounded-md border border-ink-200 px-3 py-1 text-xs font-medium text-ink-600 transition-colors hover:border-accent hover:text-accent dark:border-ink-700 dark:text-ink-200 dark:hover:border-accent"
                          aria-haspopup="dialog"
                        >
                          Complete Coursework
                        </button>
                      )}
                    </div>
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {degreeCourses.map((c) => (
                        <CourseCell key={c.id} course={c} />
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            </li>
          );
        })}
      </ol>

      {/* V2 §3.2 credential modal — diploma viewer or transcript flowchart. */}
      <Modal
        open={modal !== null}
        title={
          modal?.kind === "diploma"
            ? modal.title
            : modal?.kind === "transcript"
              ? "Undergraduate transcript"
              : ""
        }
        onClose={() => setModal(null)}
      >
        {modal?.kind === "diploma" && (
          <div className="flex flex-col gap-3">
            <iframe
              src={modal.pdfPath}
              title={modal.title}
              className="h-[70vh] w-full rounded-lg border border-ink-200 bg-ink-100 dark:border-ink-700 dark:bg-ink-900"
            />
            <p className="text-xs text-ink-400">
              If the PDF does not load,{" "}
              <a
                href={modal.pdfPath}
                target="_blank"
                rel="noreferrer noopener"
                className="text-accent underline-offset-2 hover:underline"
              >
                open it in a new tab
              </a>
              .
            </p>
          </div>
        )}
        {modal?.kind === "transcript" && <TranscriptFlowchart />}
      </Modal>
    </section>
  );
}

/* ----------------------------- Course cell ----------------------------- */

interface CellProps {
  course: Course;
}

function CourseCell({ course }: CellProps) {
  const [open, setOpen] = useState(false);

  return (
    <li
      className="group relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex w-full flex-col items-start rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 text-left transition-colors duration-150 hover:border-accent/60 dark:border-ink-700 dark:bg-ink-800 dark:hover:border-accent/60"
        aria-describedby={`course-${course.id}-tooltip`}
        aria-expanded={open}
      >
        <span className="font-mono text-xs text-ink-400">{course.code}</span>
        <span className="mt-0.5 text-sm font-medium text-ink-700 dark:text-ink-100">
          {course.name}
        </span>
        {course.tags.length > 0 && (
          <span className="mt-1.5 flex flex-wrap gap-1">
            {course.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-500 dark:bg-ink-700 dark:text-ink-300"
              >
                {t}
              </span>
            ))}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`course-${course.id}-tooltip`}
            role="tooltip"
            className="tooltip-pill -bottom-1 left-1/2 translate-y-full -translate-x-1/2"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <Markdown
              html={course.short_description_md_html}
              className="text-xs [&_p]:my-0 [&_p]:text-ink-50 dark:[&_p]:text-ink-800"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
