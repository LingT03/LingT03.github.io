/**
 * useFloating — sinusoidal idle motion for tech-stack bubbles (spec §4.4.2:
 * "Bubbles oscillate vertically using looping sinusoidal curves paired with
 * slight horizontal noise to generate a natural buoyancy look.")
 *
 * Mathematical model
 * ------------------
 * For a bubble at index i with global time t (seconds),
 *
 *     y(t) = amplitude * sin(2π t / period + φ_i)
 *     x(t) = noise_amp * sin(2π t / (period * 1.7) + φ_i * 0.41)
 *
 * where φ_i is a per-instance phase offset that prevents synchronized motion
 * across a row of bubbles.
 */

import { useEffect, useState } from "react";

export interface FloatingOptions {
  /** Vertical oscillation amplitude in px. */
  amplitude?: number;
  /** Period of the dominant oscillation in seconds. */
  period?: number;
  /** Horizontal noise amplitude in px. */
  noiseAmp?: number;
  /** Per-instance phase offset in radians. */
  phase?: number;
}

export function useFloating(opts: FloatingOptions = {}): {
  x: number;
  y: number;
} {
  const { amplitude = 4, period = 3.2, noiseAmp = 2, phase = 0 } = opts;
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let rafId = 0;
    const t0 = performance.now();
    const tick = (now: number): void => {
      const t = (now - t0) / 1000;
      const y = amplitude * Math.sin((2 * Math.PI * t) / period + phase);
      const x =
        noiseAmp * Math.sin((2 * Math.PI * t) / (period * 1.7) + phase * 0.41);
      setPos({ x, y });
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [amplitude, period, noiseAmp, phase]);

  return pos;
}
