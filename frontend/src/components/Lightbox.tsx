/**
 * Lightbox — full-screen photo viewer for the Hobbies page (V2 §3.6,
 * formerly the Photography page).
 *
 * Spec §4.7.2: "Selecting an asset triggers a lightbox component displaying
 * the high-resolution photo accompanied by its description and artistic tags."
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import type { Photo } from "../lib/types";
import { Markdown } from "./Markdown";

interface Props {
  photo: Photo | null;
  onClose: () => void;
}

export function Lightbox({ photo, onClose }: Props) {
  useEffect(() => {
    if (!photo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photo, onClose]);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo: ${photo.location}, ${photo.year}`}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink-900/85 p-4 backdrop-blur-md sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close lightbox"
            className="absolute right-4 top-4 rounded-md bg-ink-900/40 px-3 py-1 text-sm text-ink-50 hover:bg-ink-900/60"
            onClick={onClose}
          >
            Close
          </button>
          <motion.img
            src={photo.image_url}
            alt={photo.description_md || `Photograph from ${photo.location}, ${photo.year}`}
            className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-2xl"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="mt-4 max-w-2xl text-center text-ink-100">
            <p className="text-sm text-ink-300">
              {photo.location} &middot; {photo.year}
            </p>
            {photo.description_md_html && (
              <Markdown
                html={photo.description_md_html}
                className="mt-2 text-ink-100"
              />
            )}
            {photo.tags.length > 0 && (
              <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
                {photo.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full bg-ink-700/60 px-2 py-0.5 text-xs text-ink-200"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
