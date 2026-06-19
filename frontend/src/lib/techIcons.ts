/**
 * Tech-stack id → `tech-stack-icons` slug resolver.
 *
 * Maps the internal stable `TechStackItem.id` (slug-like, used across
 * content/_meta/tech_stack.json and every job/project/course reference)
 * to the canonical icon name shipped by the `tech-stack-icons` package
 * (v3.7.1, 694 icons).
 *
 * Design
 * ------
 * The resolver is intentionally a static map rather than a fuzzy lookup:
 * fuzzy matches risk shipping the wrong logo (e.g. "stan" → "stanford"),
 * which is worse than no logo at all. Misses are handled upstream by
 * `TechIcon` — first attempting the bitmap from `logo_url`, then falling
 * back to a neutral accent dot.
 *
 * Adding a new entry
 * ------------------
 * 1. Open node_modules/tech-stack-icons/dist/index.js and search for the
 *    canonical slug.
 * 2. Append a `<id>: <slug>` row below, alphabetically.
 * 3. If the package has no entry, leave it out — the fallback chain will
 *    use logo_url instead.
 */

/**
 * Subset of `IconName` aliases we override. `null` values record an
 * intentional decision not to use the package (e.g. the package's icon
 * is visually inconsistent with the rest of the stack).
 */
export const TECH_ID_TO_TSI_SLUG: Readonly<Record<string, string>> = Object.freeze({
  // Languages
  python: "python",
  r: "r",
  typescript: "typescript",
  javascript: "js",
  // SQL has no generic icon in tech-stack-icons; render as fallback.

  // ML / data frameworks
  pytorch: "pytorch",
  sklearn: "scikitlearn",
  "scikit-learn": "scikitlearn",
  huggingface: "huggingface",
  pandas: "pandas",
  // Tidyverse / ggplot2 / DoWhy / Stan / librosa / torchaudio are missing
  // from the package — handled by logo_url fallback.

  // Frontend / web
  react: "react",
  tailwind: "tailwindcss",
  tailwindcss: "tailwindcss",
  "framer-motion": "framer",

  // Cross-platform app / mobile
  dart: "dart",
  flutter: "flutter",
  // Riverpod and Drift are missing from the package — accent-dot fallback.

  // Data / local inference
  sqlite: "sqlite",
  ollama: "ollama",

  // Tooling
  docker: "docker",
  git: "git",
  github: "github",
  vscode: "vscode",
  nodejs: "nodejs",
  "node-js": "nodejs",
  rstudio: "rstudio",
});

/**
 * Resolve a tech-stack id to a package slug, or `null` if the package
 * does not ship a matching icon. Pure, side-effect-free.
 *
 * @param id - The `TechStackItem.id` field (stable slug).
 * @returns The matching `tech-stack-icons` slug, or `null` for misses.
 */
export function resolveTsiSlug(id: string): string | null {
  return TECH_ID_TO_TSI_SLUG[id] ?? null;
}
