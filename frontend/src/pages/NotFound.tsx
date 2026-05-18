/**
 * 404 fallback for unknown routes.
 */

import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-24 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">
        404
      </p>
      <h1 className="font-display text-3xl font-semibold text-ink-700 dark:text-ink-50">
        Page not found
      </h1>
      <Link to="/" className="text-accent underline-offset-2 hover:underline">
        Return home
      </Link>
    </section>
  );
}
