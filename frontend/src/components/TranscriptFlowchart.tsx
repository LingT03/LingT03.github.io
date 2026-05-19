/**
 * TranscriptFlowchart — V2 §3.2 interactive transcript modal body.
 *
 * Renders the major-relevant undergraduate coursework (Mathematics,
 * Computer Science, Data Science / Machine Learning) as a vertical,
 * reverse-chronologically-ordered flowchart. A high-visibility GPA metrics
 * block sits along the top horizontal baseline, right-aligned.
 *
 * Source of truth
 * ---------------
 * Course rows are extracted from the MSU Denver unofficial transcript
 * (Fall 2020 – Fall 2025) and filtered to:
 *   - subject ∈ {MTH, CS, DSML}
 *   - final letter grade ≥ C-  (V2 §3.2 minimum major threshold)
 *   - excludes withdrawals, failures, and re-attempt placeholders
 * The list is intentionally hard-coded inside this component rather
 * than served from /content/courses/ — the existing Course schema
 * carries tags and descriptions for the curriculum-overview grid,
 * not letter grades or chronology. Adding a new `Grade` field
 * everywhere would couple two views unnecessarily.
 *
 * Statistical note
 * ----------------
 * The GPA block reports the cumulative GPA as reported on the
 * transcript footer (3.14 / 4.0) — this is the institution's
 * weighted average over all GPA-eligible credit hours, not a
 * recomputed subset GPA across the filtered course set.
 */

import { useMemo } from "react";

interface CourseRow {
  readonly code: string;
  readonly title: string;
  readonly grade: string;
  readonly year: number;
  readonly term: "Fall" | "Spring" | "Summer";
  readonly subject: "MTH" | "CS" | "DSML";
}

/**
 * Ordering used for chronological grouping: Spring → Summer → Fall
 * within a single academic year produces a clean top-down flow.
 */
const TERM_ORDER: Readonly<Record<CourseRow["term"], number>> = {
  Spring: 0,
  Summer: 1,
  Fall: 2,
};

// ---------------------------------------------------------------------------
// Curriculum rows (filtered transcript)
// ---------------------------------------------------------------------------

const ROWS: readonly CourseRow[] = [
  // Fall 2020
  {
    code: "MTH 1111",
    title: "College Algebra for Calculus (with Lab)",
    grade: "B",
    year: 2020,
    term: "Fall",
    subject: "MTH",
  },
  // Spring 2021
  {
    code: "MTH 1120",
    title: "College Trigonometry",
    grade: "B",
    year: 2021,
    term: "Spring",
    subject: "MTH",
  },
  // Summer 2021
  {
    code: "CS 1050",
    title: "Computer Science 1",
    grade: "B",
    year: 2021,
    term: "Summer",
    subject: "CS",
  },
  {
    code: "MTH 1410",
    title: "Calculus I",
    grade: "B",
    year: 2021,
    term: "Summer",
    subject: "MTH",
  },
  // Fall 2021
  {
    code: "CS 1400",
    title: "Computer Organization 1",
    grade: "C+",
    year: 2021,
    term: "Fall",
    subject: "CS",
  },
  {
    code: "CS 2050",
    title: "Computer Science 2",
    grade: "C",
    year: 2021,
    term: "Fall",
    subject: "CS",
  },
  // Spring 2022
  {
    code: "CS 2400",
    title: "Computer Organization 2",
    grade: "B",
    year: 2022,
    term: "Spring",
    subject: "CS",
  },
  {
    code: "CS 3250",
    title: "Software Development Methods and Tools",
    grade: "B",
    year: 2022,
    term: "Spring",
    subject: "CS",
  },
  // Summer 2022
  {
    code: "CS 1030",
    title: "Computer Science Principles",
    grade: "B",
    year: 2022,
    term: "Summer",
    subject: "CS",
  },
  // Fall 2022
  {
    code: "CS 2240",
    title: "Discrete Structures for CS",
    grade: "B",
    year: 2022,
    term: "Fall",
    subject: "CS",
  },
  {
    code: "CS 3710",
    title: "Web Application Development",
    grade: "A",
    year: 2022,
    term: "Fall",
    subject: "CS",
  },
  {
    code: "MTH 3130",
    title: "Applied Methods in Linear Algebra",
    grade: "C",
    year: 2022,
    term: "Fall",
    subject: "MTH",
  },
  {
    code: "MTH 3210",
    title: "Probability and Statistics",
    grade: "B-",
    year: 2022,
    term: "Fall",
    subject: "MTH",
  },
  // Spring 2023
  {
    code: "CS 3240",
    title: "Introduction to Theory of Computation",
    grade: "C",
    year: 2023,
    term: "Spring",
    subject: "CS",
  },
  {
    code: "CS 3600",
    title: "Operating Systems",
    grade: "C",
    year: 2023,
    term: "Spring",
    subject: "CS",
  },
  {
    code: "CS 3700",
    title: "Networking and Distributed Computing",
    grade: "C",
    year: 2023,
    term: "Spring",
    subject: "CS",
  },
  {
    code: "CS 3810",
    title: "Principles of Database Systems",
    grade: "C+",
    year: 2023,
    term: "Spring",
    subject: "CS",
  },
  // Summer 2023
  {
    code: "CS 3013",
    title: "Software Design for Mobile Devices",
    grade: "A+",
    year: 2023,
    term: "Summer",
    subject: "CS",
  },
  // Fall 2023
  {
    code: "CS 3210",
    title: "Principles of Programming Languages",
    grade: "A",
    year: 2023,
    term: "Fall",
    subject: "CS",
  },
  {
    code: "CS 4050",
    title: "Algorithms and Algorithm Analysis",
    grade: "C",
    year: 2023,
    term: "Fall",
    subject: "CS",
  },
  {
    code: "CS 4360",
    title: "Senior Experience in CS",
    grade: "A+",
    year: 2023,
    term: "Fall",
    subject: "CS",
  },
  // Spring 2024
  {
    code: "CS 3120",
    title: "Machine Learning",
    grade: "A",
    year: 2024,
    term: "Spring",
    subject: "CS",
  },
  {
    code: "CS 3755",
    title: "Computer Security: Offense and Defense",
    grade: "A+",
    year: 2024,
    term: "Spring",
    subject: "CS",
  },
  // Fall 2024
  {
    code: "CS 39AE",
    title: "Data Visualization",
    grade: "A+",
    year: 2024,
    term: "Fall",
    subject: "CS",
  },
  {
    code: "MTH 3220",
    title: "Statistical Methods",
    grade: "A",
    year: 2024,
    term: "Fall",
    subject: "MTH",
  },
  // Spring 2025
  {
    code: "DSML 3850",
    title: "Cloud Computing",
    grade: "A",
    year: 2025,
    term: "Spring",
    subject: "DSML",
  },
  {
    code: "DSML 4220",
    title: "Deep Learning",
    grade: "A",
    year: 2025,
    term: "Spring",
    subject: "DSML",
  },
  {
    code: "MTH 3270",
    title: "Data Science",
    grade: "A-",
    year: 2025,
    term: "Spring",
    subject: "MTH",
  },
  // Fall 2025
  {
    code: "DSML 4360",
    title: "Senior Experience in DS and ML",
    grade: "A",
    year: 2025,
    term: "Fall",
    subject: "DSML",
  },
  {
    code: "MTH 2410",
    title: "Calculus II",
    grade: "B+",
    year: 2025,
    term: "Fall",
    subject: "MTH",
  },
];

// ---------------------------------------------------------------------------
// Metrics block (transcript footer)
// ---------------------------------------------------------------------------

const METRICS = {
  cumulativeGpa: "3.14",
  totalCredits: 161,
  degreesAwarded: 2,
  minor: "Mathematics",
} as const;

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

type SubjectKey = CourseRow["subject"];

const SUBJECT_COLORS: Readonly<Record<SubjectKey, string>> = {
  MTH: "bg-accent/10 text-accent",
  CS: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  DSML: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

const SUBJECT_LABELS: Readonly<Record<SubjectKey, string>> = {
  MTH: "Mathematics",
  CS: "Computer Science",
  DSML: "DS / ML",
};

/**
 * Group the filtered transcript by (year, term) in reverse chronological order.
 */
function useGroupedRows(): ReadonlyArray<{
  year: number;
  term: CourseRow["term"];
  rows: readonly CourseRow[];
}> {
  return useMemo(() => {
    const buckets = new Map<string, CourseRow[]>();
    ROWS.forEach((r) => {
      const key = `${r.year}-${r.term}`;
      const bucket = buckets.get(key) ?? [];
      bucket.push(r);
      buckets.set(key, bucket);
    });
    return Array.from(buckets.entries())
      .map(([k, rows]) => {
        const [yearStr, term] = k.split("-");
        return {
          year: Number(yearStr),
          term: term as CourseRow["term"],
          rows,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return TERM_ORDER[b.term] - TERM_ORDER[a.term];
      });
  }, []);
}

/**
 * Vertical flowchart of major-relevant undergraduate coursework, with a
 * right-aligned GPA metrics block along the top baseline.
 */
export function TranscriptFlowchart(): JSX.Element {
  const grouped = useGroupedRows();

  return (
    <div className="flex flex-col gap-6">
      {/* Top baseline: title (left) + metrics (right) ----------------- */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-200/60 pb-4 dark:border-ink-700/60">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ink-400">
            Undergraduate coursework
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink-700 dark:text-ink-50">
            MSU Denver — major-relevant catalog
          </h3>
          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
            Filtered to Mathematics, Computer Science, and Data Science / ML
            courses; minimum grade threshold C−.
          </p>
        </div>

        <dl className="ml-auto grid grid-cols-2 gap-x-5 gap-y-1.5 rounded-lg border border-ink-200 bg-ink-50 px-4 py-3 text-right dark:border-ink-700 dark:bg-ink-800">
          <dt className="text-[10px] font-medium uppercase tracking-widest text-ink-400">
            Cumulative GPA
          </dt>
          <dd className="font-mono text-sm font-semibold text-ink-700 dark:text-ink-50">
            {METRICS.cumulativeGpa}
            <span className="text-ink-400"> / 4.00</span>
          </dd>
          <dt className="text-[10px] font-medium uppercase tracking-widest text-ink-400">
            Credits earned
          </dt>
          <dd className="font-mono text-sm font-semibold text-ink-700 dark:text-ink-50">
            {METRICS.totalCredits}
          </dd>
          <dt className="text-[10px] font-medium uppercase tracking-widest text-ink-400">
            Degrees awarded
          </dt>
          <dd className="font-mono text-sm font-semibold text-ink-700 dark:text-ink-50">
            {METRICS.degreesAwarded}
          </dd>
          <dt className="text-[10px] font-medium uppercase tracking-widest text-ink-400">
            Minor
          </dt>
          <dd className="font-mono text-sm font-semibold text-ink-700 dark:text-ink-50">
            {METRICS.minor}
          </dd>
        </dl>
      </header>

      {/* Vertical flowchart ------------------------------------------ */}
      <ol className="relative space-y-7 border-l border-ink-200 pl-6 dark:border-ink-700">
        {grouped.map(({ year, term, rows }) => (
          <li key={`${year}-${term}`} className="relative">
            <span
              aria-hidden
              className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-ink-50 dark:bg-ink-900"
            />
            <header className="mb-2">
              <p className="text-xs font-medium uppercase tracking-widest text-accent">
                {term} {year}
              </p>
            </header>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {rows.map((c) => (
                <li
                  key={`${c.code}-${c.year}-${c.term}`}
                  className="flex items-start justify-between gap-3 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 dark:border-ink-700 dark:bg-ink-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-ink-400">
                        {c.code}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${SUBJECT_COLORS[c.subject]}`}
                      >
                        {SUBJECT_LABELS[c.subject]}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-ink-700 dark:text-ink-100">
                      {c.title}
                    </p>
                  </div>
                  <span
                    className="shrink-0 font-mono text-sm font-semibold text-ink-700 dark:text-ink-50"
                    aria-label={`Final grade ${c.grade}`}
                  >
                    {c.grade}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
