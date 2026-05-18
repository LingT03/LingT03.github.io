/**
 * Top navigation bar with desktop links and a mobile drawer.
 *
 * Spec §4.1: "Affixed persistently to the top edge on desktop layouts;
 * collapses into an interactive touch menu overlay on mobile screen
 * configurations." Provides aria-expanded on the hamburger trigger and
 * aria-modal on the mobile drawer for accessibility compliance (§7.3).
 */

import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../lib/theme";
import { PROFILE } from "../lib/profile";

const links = [
  { to: "/academic", label: "Academic" },
  { to: "/professional", label: "Profiles" },
  { to: "/projects", label: "Projects" },
  { to: "/books", label: "Books" },
  { to: "/photography", label: "Photo" },
] as const;

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header
      className="sticky top-0 z-40 border-b border-ink-200/60 bg-ink-50/80 backdrop-blur-md dark:border-ink-700/60 dark:bg-ink-900/70"
      role="banner"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="font-display text-lg font-semibold tracking-tight text-ink-700 hover:text-accent dark:text-ink-50"
          aria-label="Home"
        >
          {PROFILE.shortName}
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ease-apple ${
                  isActive
                    ? "text-accent"
                    : "text-ink-600 hover:text-ink-700 dark:text-ink-300 dark:hover:text-ink-50"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={toggle}
            className="ml-2 rounded-md border border-ink-200 px-2.5 py-1 text-xs text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-700 dark:border-ink-700 dark:text-ink-300 dark:hover:border-ink-600 dark:hover:text-ink-50"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </nav>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-600 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800 md:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
          onClick={() => setOpen((o) => !o)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path d="M3 5h14v1.5H3zM3 9.25h14v1.5H3zM3 13.5h14V15H3z" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Primary navigation"
            className="md:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-t border-ink-200/60 bg-ink-50 px-4 py-3 dark:border-ink-700/60 dark:bg-ink-900">
              <ul className="flex flex-col gap-1">
                {links.map((l) => (
                  <li key={l.to}>
                    <NavLink
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-md px-3 py-2 text-sm ${
                          isActive
                            ? "bg-ink-100 text-accent dark:bg-ink-800"
                            : "text-ink-600 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
                        }`
                      }
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={toggle}
                    className="mt-2 w-full rounded-md border border-ink-200 px-3 py-2 text-left text-sm text-ink-600 dark:border-ink-700 dark:text-ink-200"
                  >
                    Switch to {theme === "dark" ? "light" : "dark"} mode
                  </button>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
