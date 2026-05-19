/**
 * Work page — V2 §3.3 (formerly Professional / "Profiles").
 *
 * - "Overview - Professional Background" header.
 * - Sequential job cards, newest-first, with Markdown bullets.
 * - Each job's tech_stack rendered as evasive (cursor-evading) bubbles
 *   carrying official tech-stack-icons SVGs.
 * - Toolbar of tech-keyword chips above the timeline; selecting one or
 *   more chips filters the visible job set to only those that reference
 *   at least one of the active tech ids (V2 §3.3 cross-filter engine).
 */

import { useEffect, useMemo, useState } from "react";
import type { Job, TechStackItem } from "../lib/types";
import { loadJobs, loadTechStack } from "../lib/data";
import { Markdown } from "../components/Markdown";
import { PageHeader } from "../components/PageHeader";
import { TechBubbleRow } from "../components/TechBubbleRow";
import { FilterChip } from "../components/FilterChip";
import { formatMonthYear } from "../lib/format";

export function Work() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [techStack, setTechStack] = useState<TechStackItem[]>([]);
  const [activeTech, setActiveTech] = useState<Set<string>>(new Set());

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

  // Aggregate every tech id that appears on at least one job, with counts.
  const techCounts = useMemo(() => {
    const m = new Map<string, number>();
    jobs.forEach((j) => j.tech_stack.forEach((id) => m.set(id, (m.get(id) ?? 0) + 1)));
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [jobs]);

  const techNameById = useMemo(() => {
    const m = new Map<string, string>();
    techStack.forEach((t) => m.set(t.id, t.name));
    return m;
  }, [techStack]);

  const toggleTech = (id: string) =>
    setActiveTech((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const visibleJobs = useMemo(() => {
    if (activeTech.size === 0) return jobs;
    return jobs.filter((j) => j.tech_stack.some((id) => activeTech.has(id)));
  }, [jobs, activeTech]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <PageHeader
        eyebrow="Overview"
        title="Professional background"
        subtitle="Roles, contributions, and engineering stacks. Each badge below floats idly and evades the cursor — try chasing one."
      />

      {techCounts.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-ink-200/60 pb-4 dark:border-ink-700/60">
          <span className="text-xs font-medium uppercase tracking-widest text-ink-400">
            Filter by stack
          </span>
          {techCounts.map(([id, count]) => (
            <FilterChip
              key={id}
              label={techNameById.get(id) ?? id}
              count={count}
              active={activeTech.has(id)}
              onToggle={() => toggleTech(id)}
            />
          ))}
          {activeTech.size > 0 && (
            <button
              type="button"
              onClick={() => setActiveTech(new Set())}
              className="ml-2 text-xs text-ink-500 underline-offset-2 hover:underline dark:text-ink-400"
            >
              Clear
            </button>
          )}
        </div>
      )}

      <ul className="flex flex-col gap-6">
        {visibleJobs.map((job) => (
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
