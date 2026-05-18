/**
 * EvasiveBubble — a single tech-stack badge that floats idly and evades the
 * cursor. Composes useFloating (idle sinusoidal motion) and useEvasion
 * (cursor-distance push-away) into a single translation.
 *
 * Spec §4.4.2: behavior is fully data-driven — the rendered TechStackItem
 * is passed in by the parent; this component never reads content payloads
 * directly.
 */

import { motion } from "framer-motion";
import type { TechStackItem } from "../lib/types";
import { useEvasion } from "../lib/hooks/useEvasion";
import { useFloating } from "../lib/hooks/useFloating";

interface Props {
  tech: TechStackItem;
  phase?: number;
}

export function EvasiveBubble({ tech, phase = 0 }: Props) {
  const { ref, tx, ty } = useEvasion({
    proximity: 110,
    strength: 36,
    decay: 55,
  });
  const float = useFloating({ amplitude: 4, period: 3.2, phase });

  return (
    <motion.div
      ref={ref}
      animate={{ x: tx + float.x, y: ty + float.y }}
      transition={{ type: "spring", stiffness: 180, damping: 18, mass: 0.6 }}
      className="inline-flex select-none items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-3 py-1 text-xs font-medium text-ink-600 shadow-sm dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
      style={{ willChange: "transform" }}
      // Keep the badge accessible via keyboard / screen reader; spec §7.3.
      tabIndex={0}
      aria-label={`Technology: ${tech.name}`}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
      />
      {tech.name}
    </motion.div>
  );
}
