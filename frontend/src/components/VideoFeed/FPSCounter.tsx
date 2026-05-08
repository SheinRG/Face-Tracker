/** FPS counter with digit-flip animation via AnimatePresence. */

import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";

export function FPSCounter() {
  const fps = useAppStore((s) => s.fps);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-xs font-mono">
      <span className="text-text-secondary">FPS</span>
      <div className="relative w-6 h-5 overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={fps}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute text-accent font-bold"
          >
            {fps}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
