
import { motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { StatusBadge } from "../VideoFeed/StatusBadge";

export function Header() {
  const connectionStatus = useAppStore((s) => s.connectionStatus);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-surface/80 backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10">
          <svg
            className="w-5 h-5 text-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary tracking-tight">
            Face Detection Studio
          </h1>
          <p className="text-xs text-text-secondary">
            Real-time video analysis pipeline
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <StatusBadge status={connectionStatus} />
        <span className="hidden md:block px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary bg-surface-elevated border border-border">
          v1.0.0
        </span>
      </div>
    </motion.header>
  );
}