/**
 * TechIcon — hybrid resolver component for tech-stack logos.
 *
 * Resolution order (V2 §2.2 hybrid policy):
 *   1. `tech-stack-icons` package SVG, keyed by `TECH_ID_TO_TSI_SLUG[id]`.
 *   2. `<img>` from `TechStackItem.logo_url` (legacy /logos/*.svg assets).
 *   3. Neutral accent dot (`<span aria-hidden>`).
 *
 * The component is deliberately presentational — it never fetches data or
 * mutates state, so it can be embedded inside both static rows (Projects,
 * Academic) and physics-driven containers (EvasiveBubble in Professional).
 *
 * Variant selection follows the user's active theme: dark UI gets the
 * package's "dark" variant, light UI gets "light". This keeps logos
 * legible against both backgrounds without hand-tuned CSS filters.
 */

import { useState, type CSSProperties } from "react";
import StackIcon from "tech-stack-icons";
import type { TechStackItem } from "../lib/types";
import { resolveTsiSlug } from "../lib/techIcons";
import { useTheme } from "../lib/theme";

interface Props {
  /** Reference into `content/_meta/tech_stack.json` */
  tech: TechStackItem;
  /** Render size in pixels. Defaults to 16 (chip / bubble inline glyph). */
  size?: number;
  /** Optional className passed to the outer span wrapper. */
  className?: string;
}

/**
 * Render a single tech-stack icon.
 *
 * @param props.tech  - The fully-resolved `TechStackItem` record.
 * @param props.size  - Glyph size in px (default 16).
 * @param props.className - Optional outer span class.
 */
export function TechIcon({ tech, size = 16, className }: Props): JSX.Element {
  const { theme } = useTheme();
  const [imgFailed, setImgFailed] = useState(false);

  // Step 1 — tech-stack-icons package.
  const tsiSlug = resolveTsiSlug(tech.id);
  if (tsiSlug) {
    const style: CSSProperties = { width: size, height: size };
    return (
      <span
        className={className}
        aria-hidden
        style={{ display: "inline-flex", lineHeight: 0 }}
      >
        {/* StackIcon renders an <svg>; we constrain box via wrapper sizing. */}
        <StackIcon
          // The package's `IconName` type is a union of all 694 slugs; our
          // resolver promises a valid key but TypeScript cannot prove that
          // statically without importing the full union here.
          name={tsiSlug as Parameters<typeof StackIcon>[0]["name"]}
          variant={theme === "dark" ? "dark" : "light"}
          style={style}
        />
      </span>
    );
  }

  // Step 2 — legacy logo_url asset.
  if (tech.logo_url && !imgFailed) {
    return (
      <img
        src={tech.logo_url}
        alt=""
        aria-hidden
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setImgFailed(true)}
        className={className}
        style={{ display: "inline-block", objectFit: "contain" }}
      />
    );
  }

  // Step 3 — neutral fallback glyph (preserves layout rhythm).
  return (
    <span
      className={className}
      aria-hidden
      style={{
        display: "inline-block",
        width: size * 0.4,
        height: size * 0.4,
        borderRadius: "999px",
        background: "currentColor",
        opacity: 0.55,
      }}
    />
  );
}
