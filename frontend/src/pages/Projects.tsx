/**
 * Projects page — spec §4.5.
 *
 * - Overview banner.
 * - Grid of project cards with elevated hover, accent border transition.
 * - Click opens a modal with blurred backdrop, long description Markdown,
 *   tech stack bubbles, and links.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Project, ProjectStatus, TechStackItem } from "../lib/types";
import { loadProjects, loadTechStack } from "../lib/data";
import { Markdown } from "../components/Markdown";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { TechBubbleRow } from "../components/TechBubbleRow";

/**
 * Display priority by lifecycle stage (lower sorts first). Active / in-progress
 * work is favored to the top; completed work sinks to the bottom; prototype and
 * archived sit in between. Within a tier, projects order by date (newest first).
 */
const STATUS_RANK: Record<ProjectStatus, number> = {
  in_progress: 0,
  active: 0,
  prototype: 1,
  archived: 1,
  completed: 2,
};

/** Epoch milliseconds for a project's sort anchor; missing dates sink last. */
function dateMs(p: Project): number {
  return p.date ? Date.parse(p.date) : Number.NEGATIVE_INFINITY;
}

/**
 * Total order over projects: status tier ascending, then date descending,
 * with a title tiebreak so the sort is stable and deterministic.
 */
function compareProjects(a: Project, b: Project): number {
  const tier = STATUS_RANK[a.status] - STATUS_RANK[b.status];
  if (tier !== 0) return tier;
  const byDate = dateMs(b) - dateMs(a);
  if (byDate !== 0) return byDate;
  return a.title.localeCompare(b.title);
}

function getStatusColor(status: string): string {
  switch (status) {
    case "active":
    case "in_progress":
      return "border border-blue-400/40 bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
    case "completed":
      return "border border-emerald-400/40 bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
    case "prototype":
      return "border border-yellow-400/40 bg-yellow-300/15 text-yellow-700 dark:bg-yellow-300/10 dark:text-yellow-300";
    default:
      return "border border-ink-200 bg-ink-100 text-ink-500 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300";
  }
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [techStack, setTechStack] = useState<TechStackItem[]>([]);
  const [active, setActive] = useState<Project | null>(null);

  useEffect(() => {
    Promise.all([loadProjects(), loadTechStack()]).then(([p, t]) => {
      setProjects(p);
      setTechStack(t);
    });
  }, []);

  // Order: active/in-progress first, completed last, newest-first within tier.
  const sortedProjects = useMemo(
    () => [...projects].sort(compareProjects),
    [projects],
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <PageHeader
        eyebrow="Projects"
        title="Research and engineering systems"
        subtitle="A grid of standalone platforms — research benchmarks, applied modeling, and tooling. Click any card for the full design notes."
      />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedProjects.map((p) => (
          <li key={p.id}>
            <motion.button
              type="button"
              onClick={() => setActive(p)}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              className="flex h-full w-full flex-col rounded-xl border border-ink-200 bg-ink-50 p-5 text-left shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-accent/60 hover:shadow-md focus:outline-none focus-visible:border-accent dark:border-ink-700 dark:bg-ink-800 dark:hover:border-accent/60"
              aria-haspopup="dialog"
              aria-label={`Open details for ${p.title}`}
            >
              <header className="mb-2 flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-ink-700 dark:text-ink-50">
                  {p.title}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${getStatusColor(
                    p.status,
                  )}`}
                >
                  {p.status.replace("_", " ")}
                </span>
              </header>
              {(p.role || p.timeframe) && (
                <p className="mb-2 text-xs text-ink-500 dark:text-ink-400">
                  {p.role}
                  {p.role && p.timeframe ? " · " : ""}
                  {p.timeframe}
                </p>
              )}
              <Markdown html={p.short_description_md_html} className="flex-1" />
              <div className="mt-3 border-t border-ink-200/60 pt-3 dark:border-ink-700/60">
                <TechBubbleRow techIds={p.tech_stack} techStack={techStack} />
              </div>
            </motion.button>
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
            <Markdown html={active.long_description_md_html} />
            <div>
              <h4 className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-400">
                Tech stack
              </h4>
              <TechBubbleRow
                techIds={active.tech_stack}
                techStack={techStack}
              />
            </div>
            {Object.keys(active.links).length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-400">
                  Links
                </h4>
                <ul className="flex flex-wrap gap-3 text-sm">
                  {Object.entries(active.links).map(([k, v]) =>
                    v ? (
                      <li key={k}>
                        <a
                          href={v}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-accent underline-offset-2 hover:underline"
                        >
                          {k}
                        </a>
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}
