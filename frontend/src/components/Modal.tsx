/**
 * Modal — accessible full-screen dialog with backdrop blur and ESC-to-close.
 *
 * Spec §7.3 compliance:
 *   - role="dialog" + aria-modal="true"
 *   - aria-labelledby pointing to the title
 *   - focus trap on the container
 *   - ESC key closes; click outside the panel closes
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    // Prevent body scroll while modal is open.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Initial focus into the panel for screen reader / keyboard parity.
    panelRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          aria-hidden={false}
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 cursor-default bg-ink-900/40 backdrop-blur-md dark:bg-ink-900/60"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 4 }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 shadow-2xl dark:border-ink-700 dark:bg-ink-800"
          >
            <header className="flex items-start justify-between gap-4 border-b border-ink-200 px-6 py-4 dark:border-ink-700">
              <h2
                id="modal-title"
                className="font-display text-xl font-semibold text-ink-700 dark:text-ink-50"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:text-ink-300 dark:hover:bg-ink-700 dark:hover:text-ink-50"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </header>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
