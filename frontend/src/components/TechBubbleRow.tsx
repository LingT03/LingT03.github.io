/**
 * TechBubbleRow — renders an array of TechStackItem references, resolving
 * each id against the loaded tech_stack table.
 */

import type { TechStackItem } from "../lib/types";
import { EvasiveBubble } from "./EvasiveBubble";

interface Props {
  techIds: string[];
  techStack: TechStackItem[];
}

export function TechBubbleRow({ techIds, techStack }: Props) {
  const map = new Map(techStack.map((t) => [t.id, t]));
  return (
    <div className="flex flex-wrap items-center gap-2.5 py-2">
      {techIds.map((id, i) => {
        const tech = map.get(id);
        if (!tech) return null;
        // Phase offset spreads the sinusoidal motion across the row.
        return <EvasiveBubble key={id} tech={tech} phase={i * 0.7} />;
      })}
    </div>
  );
}
