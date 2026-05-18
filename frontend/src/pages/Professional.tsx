/**
 * Professional page — spec §4.4.
 *
 * - "Overview - Professional Background" header.
 * - Sequential job cards, newest-first, with Markdown bullets.
 * - Each job's tech_stack rendered as evasive (cursor-evading) bubbles.
 */

import { useEffect, useState } from "react";
import type { Job, TechStackItem } from "../lib/types";
import { loadJobs, loadTechStack } from "../lib/data";
import { Markdown } from "../components/Markdown";
import { PageHeader } from "../components/PageHeader";
import { TechBubbleRow } from "../components/TechBubbleRow";
import { formatMonthYear } from "../lib/format";

export function Professional() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [techStack, setTechStack] = useState<TechStackItem[]>([]);

  useEffect(() => {
    Promise.all([loadJobs(), loadTechStack()]).then(([j, t]) => {
      // Sort newest-first: nulls (present) first, then by start_date desc.
      const sorted = [...j].sort((a, b) => {
        if (a.end_date === null && b.end_date !== null) return -1;
        if (a.end_date !== null && b.end_date === null) return 1;
        return b.start_date.localeCompare(a.start_date);
      });
      setJobs(sorted);
      setTechStack(t);
    });
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <PageHeader
        eyebrow="Overview"
        title="Professional background"
        subtitle="Roles, contributions, and engineering stacks. Each badge below floats idly and evades the cursor — try chasing one."
      />

      <ul className="flex flex-col gap-6">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="rounded-xl border border-ink-200 bg-ink-50 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800"
          >
            <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink-700 dark:text-ink-50">
                  {job.title}
                </h2>
                <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-300">
                  {job.organization} &middot; {job.location}
                </p>
              </div>
              <p className="text-xs text-ink-400 dark:text-ink-500">
                {formatMonthYear(job.start_date)} &mdash;{" "}
                {formatMonthYear(job.end_date)}
              </p>
            </header>

            <Markdown html={job.description_md_html} />

            {job.tech_stack.length > 0 && (
              <div className="mt-4 border-t border-ink-200/60 pt-4 dark:border-ink-700/60">
                <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-400">
                  Tech stack
                </p>
                <TechBubbleRow techIds={job.tech_stack} techStack={techStack} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
