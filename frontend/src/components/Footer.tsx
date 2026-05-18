/**
 * Sticky footer with structured external contact anchors.
 * Spec §4.1: links to GitHub, LinkedIn, LeetCode, plus a mailto endpoint.
 */

import { PROFILE } from "../lib/profile";

export function Footer() {
  return (
    <footer
      className="mt-16 border-t border-ink-200/60 bg-ink-50/60 dark:border-ink-700/60 dark:bg-ink-900/40"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-sm text-ink-500 dark:text-ink-400 sm:flex-row sm:items-center sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {PROFILE.name}. Built with React,
          Tailwind, and Framer Motion.
        </p>
        <nav aria-label="Contact" className="flex flex-wrap items-center gap-4">
          <a
            href={PROFILE.links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-accent"
          >
            GitHub
          </a>
          <a
            href={PROFILE.links.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-accent"
          >
            LinkedIn
          </a>
          <a
            href={PROFILE.links.leetcode}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-accent"
          >
            LeetCode
          </a>
          <a
            href={PROFILE.links.deepml}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-accent"
          >
            Deep-ML
          </a>
          <a href={`mailto:${PROFILE.email}`} className="hover:text-accent">
            Email
          </a>
        </nav>
      </div>
    </footer>
  );
}
