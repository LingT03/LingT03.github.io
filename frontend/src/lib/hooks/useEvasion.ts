/**
 * useEvasion — cursor-distance physics for the "evasive tech-stack bubbles".
 *
 * Mathematical model
 * ------------------
 * Let p = bubble center and c = cursor position. The displacement vector
 * d = p - c has magnitude r = ||d||. We define a smooth radial force
 *
 *     f(r) = strength * exp(-r / decay)        for r < proximity
 *          = 0                                  otherwise
 *
 * and translate the bubble by f(r) * (d / r). This produces a soft "push-away"
 * effect that decays exponentially with distance — closer to a Gaussian
 * field than a hard collider, which preserves the spec's smooth aesthetic.
 *
 * The hook is content-agnostic: it returns a ref and a translation pair
 * (tx, ty), and never reads or writes data payloads. Spec §4.4.2: "Adding a
 * technology element onto a job profile only requires adjusting data JSON
 * files; animation code blocks remain untouched."
 */

import { useEffect, useRef, useState } from "react";

export interface EvasionOptions {
  /** Proximity radius in px at which the bubble starts reacting. */
  proximity?: number;
  /** Push strength at zero distance, in px. */
  strength?: number;
  /** Exponential decay length in px. */
  decay?: number;
}

export interface EvasionState {
  ref: React.RefObject<HTMLDivElement>;
  tx: number;
  ty: number;
}

/**
 * Track a global cursor singleton so N bubbles all read the same source of
 * truth without each registering its own mousemove listener.
 */
let cursorX = -10_000;
let cursorY = -10_000;
const subscribers = new Set<() => void>();
let bound = false;

function bindCursorListener(): void {
  if (bound || typeof window === "undefined") return;
  bound = true;
  window.addEventListener(
    "mousemove",
    (e: MouseEvent) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      subscribers.forEach((fn) => fn());
    },
    { passive: true },
  );
  window.addEventListener(
    "mouseleave",
    () => {
      cursorX = -10_000;
      cursorY = -10_000;
      subscribers.forEach((fn) => fn());
    },
    { passive: true },
  );
}

export function useEvasion(opts: EvasionOptions = {}): EvasionState {
  const { proximity = 120, strength = 40, decay = 60 } = opts;
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<{ tx: number; ty: number }>({
    tx: 0,
    ty: 0,
  });

  useEffect(() => {
    bindCursorListener();

    let rafId: number | null = null;
    const compute = (): void => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cx - cursorX;
      const dy = cy - cursorY;
      const r = Math.hypot(dx, dy);

      let tx = 0;
      let ty = 0;
      if (r < proximity && r > 0.001) {
        const f = strength * Math.exp(-r / decay);
        tx = (dx / r) * f;
        ty = (dy / r) * f;
      }
      setOffset((prev) =>
        Math.abs(prev.tx - tx) < 0.1 && Math.abs(prev.ty - ty) < 0.1
          ? prev
          : { tx, ty },
      );
    };

    const onTick = (): void => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        compute();
      });
    };

    subscribers.add(onTick);
    return () => {
      subscribers.delete(onTick);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [proximity, strength, decay]);

  return { ref, tx: offset.tx, ty: offset.ty };
}
