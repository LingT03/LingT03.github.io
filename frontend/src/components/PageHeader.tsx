/**
 * PageHeader — consistent title block reused across content pages.
 */

import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <header className="mb-8">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-700 dark:text-ink-50 sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 max-w-2xl text-ink-500 dark:text-ink-400">
          {subtitle}
        </p>
      )}
    </header>
  );
}
