/**
 * ThemeToggle — single persistent UI switch (V2 §2.2).
 *
 * Replaces the prior "Light/Dark" text button with a sliding pill switch:
 *   - sun glyph on the left, moon glyph on the right;
 *   - a thumb element animates between them via Framer Motion;
 *   - the underlying theme state lives in `useTheme()` and is already
 *     persisted to localStorage by `ThemeProvider` (see lib/theme.tsx),
 *     so no additional storage logic is needed here.
 *
 * Accessibility
 * -------------
 * - `role="switch"` + `aria-checked` exposes the binary state to AT.
 * - The whole control is a single focusable button so keyboard users
 *   activate it with Space / Enter exactly once.
 */

import { motion } from "framer-motion";
import { useTheme } from "../lib/theme";

interface Props {
  /** Optional className for layout placement. */
  className?: string;
}

export function ThemeToggle({ className = "" }: Props): JSX.Element {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Activate ${isDark ? "light" : "dark"} mode`}
      onClick={toggle}
      className={
        "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors " +
        "border-ink-200 bg-ink-100 hover:border-ink-300 " +
        "dark:border-ink-700 dark:bg-ink-800 dark:hover:border-ink-600 " +
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 " +
        className
      }
    >
      {/* Sun glyph (left, visible when light) */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1.5 top-1/2 z-10 -translate-y-1/2 text-[10px] leading-none text-ink-500 dark:text-ink-400"
      >
        <SunIcon />
      </span>
      {/* Moon glyph (right, visible when dark) */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-1.5 top-1/2 z-10 -translate-y-1/2 text-[10px] leading-none text-ink-500 dark:text-ink-300"
      >
        <MoonIcon />
      </span>
      {/* Sliding thumb */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ x: isDark ? "1.5rem" : "0.125rem", y: "-50%" }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className={
          "absolute left-0 top-1/2 h-5 w-5 rounded-full bg-ink-50 shadow-sm " +
          "dark:bg-ink-200"
        }
      />
    </button>
  );
}

/* ------------------------------ Glyphs ------------------------------- */

function SunIcon(): JSX.Element {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon(): JSX.Element {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
