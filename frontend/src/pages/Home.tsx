/**
 * Home page — asymmetrical split pane (spec §4.2).
 *
 * Left pane: fixed profile sidebar with circular avatar, name header,
 * short bio, and external links cluster (GitHub, LinkedIn, LeetCode).
 *
 * Right pane: "Website Navigation Guide" header + section showcase cards
 * routing to each primary page, with hover elevation animations.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PROFILE } from "../lib/profile";
import { Modal } from "../components/Modal";

const sections = [
  {
    to: "/academic",
    title: "Academic",
    desc: "Graduate and undergraduate coursework, degree overviews, and tagged study tracks.",
  },
  {
    to: "/publications",
    title: "Publications",
    desc: "Research output — preprints and articles with author ORCID links, DOIs, and abstracts.",
  },
  {
    to: "/work",
    title: "Work",
    desc: "Job timeline with animated tech-stack bubbles and Markdown contribution logs.",
  },
  {
    to: "/projects",
    title: "Projects",
    desc: "Research and engineering projects with full design notes and live links.",
  },
  {
    to: "/books",
    title: "Books",
    desc: "Reading log with categories, ratings (0.00–10.00), summaries, and notes.",
  },
  {
    to: "/hobbies",
    title: "Hobbies",
    desc: "Photography rigs and personal devices as a grid of structured cards.",
  },
  {
    to: "/certificates",
    title: "Certificates",
    desc: "Technical certifications and professional training milestones.",
  },
] as const;

export function Home() {
  const [resumeOpen, setResumeOpen] = useState(false);

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-16">
      {/* Left pane — profile sidebar. Sticky on desktop. */}
      <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-col items-start">
          <div className="mb-5 h-28 w-28 overflow-hidden rounded-full border border-ink-200 bg-ink-100 shadow-sm dark:border-ink-700 dark:bg-ink-800">
            <img
              src={PROFILE.avatarUrl}
              alt={`${PROFILE.name} portrait`}
              className="h-full w-full object-cover"
              // Graceful fallback if avatar asset is missing.
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-700 dark:text-ink-50 sm:text-4xl">
            {PROFILE.name}
          </h1>
          <p className="mt-3 max-w-md text-ink-500 dark:text-ink-300">
            {PROFILE.bio}
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setResumeOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-ink-200 bg-ink-50 px-4 py-1.5 text-sm font-medium text-ink-600 shadow-sm transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200 dark:hover:border-accent"
              aria-label="View Resume"
            >
              View Resume
            </button>
          </div>
          <ul className="mt-6 flex flex-col gap-2 text-sm">
            <li>
              <a
                href={PROFILE.links.github}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 text-ink-600 hover:text-accent dark:text-ink-200"
              >
                <span className="font-mono text-xs text-ink-400">~</span>
                <span>Github</span>
              </a>
            </li>
            <li>
              <a
                href={PROFILE.links.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 text-ink-600 hover:text-accent dark:text-ink-200"
              >
                <span className="font-mono text-xs text-ink-400">~</span>
                <span>linkedin</span>
              </a>
            </li>
            <li>
              <a
                href={PROFILE.links.leetcode}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 text-ink-600 hover:text-accent dark:text-ink-200"
              >
                <span className="font-mono text-xs text-ink-400">~</span>
                <span>Leetcode</span>
              </a>
            </li>
            <li>
              <a
                href={PROFILE.links.deepml}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 text-ink-600 hover:text-accent dark:text-ink-200"
              >
                <span className="font-mono text-xs text-ink-400">~</span>
                <span>Deep-ML</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${PROFILE.email}`}
                className="inline-flex items-center gap-2 text-ink-600 hover:text-accent dark:text-ink-200"
              >
                <span className="font-mono text-xs text-ink-400">~</span>
                <span>{PROFILE.email}</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Right pane — navigation guide. */}
      <div className="lg:col-span-8">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Welcome
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-700 dark:text-ink-50 sm:text-3xl">
            Website Navigation Guide
          </h2>
          <p className="mt-2 max-w-2xl text-ink-500 dark:text-ink-400">
            A reader's index to the content on this site. Each card routes to a
            section with its own data model and interaction language.
          </p>
        </header>

        <ul className="grid gap-3 sm:grid-cols-2">
          {sections.map((s) => (
            <li key={s.to}>
              <Link
                to={s.to}
                className="block focus:outline-none"
                aria-label={`${s.title} — ${s.desc}`}
              >
                <motion.article
                  initial={{ y: 0 }}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="group h-full rounded-xl border border-ink-200 bg-ink-50 p-5 shadow-sm transition-shadow duration-200 ease-apple hover:shadow-md dark:border-ink-700 dark:bg-ink-800"
                >
                  <h3 className="font-display text-lg font-semibold text-ink-700 group-hover:text-accent dark:text-ink-50">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-300">
                    {s.desc}
                  </p>
                </motion.article>
              </Link>
            </li>
          ))}
        </ul>

        <footer className="mt-8 border-t border-ink-200/60 pt-5 text-xs text-ink-400 dark:border-ink-700/60 dark:text-ink-500">
          Read more &mdash;{" "}
          <Link
            to="/api-docs"
            className="text-accent underline-offset-2 hover:underline"
          >
            API documentation
          </Link>
          .
        </footer>
      </div>

      <Modal
        open={resumeOpen}
        title="Resume"
        onClose={() => setResumeOpen(false)}
      >
        <div className="flex flex-col gap-3">
          <iframe
            src="/LingThang_resume.pdf"
            title="Resume"
            className="h-[70vh] w-full rounded-lg border border-ink-200 bg-ink-100 dark:border-ink-700 dark:bg-ink-900"
          />
          <p className="text-xs text-ink-400">
            If the PDF does not load,{" "}
            <a
              href="/LingThang_resume.pdf"
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent underline-offset-2 hover:underline"
            >
              open it in a new tab
            </a>
            .
          </p>
        </div>
      </Modal>
    </section>
  );
}
