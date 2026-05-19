/**
 * Certificates page (V2 §2.1).
 *
 * Standalone destination for technical and professional training
 * achievements. Currently a skeleton view — the certificate catalog
 * will be sourced from a new `content/certificates/` Markdown module
 * in a follow-up pass.
 */

import { PageHeader } from "../components/PageHeader";

export function Certificates(): JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <PageHeader
        eyebrow="Certificates"
        title="Technical and professional training"
        subtitle="Industry credentials, completed coursework, and short-form training events. Catalog under construction."
      />
      <p className="text-sm text-ink-500 dark:text-ink-400">
        This view will index every issued certificate with its provider,
        completion date, and verification URL. The content layer is being
        seeded — check back shortly.
      </p>
    </section>
  );
}
