
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";

function StatCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: [1, 1.15, 1],
      transition: { type: "spring", stiffness: 300, damping: 15, duration: 0.3 },
    });
  }, [value, controls]);

  return (
    <div className="p-4 rounded-xl bg-surface-elevated border border-border">
      <p className="mb-1 text-xs font-medium text-text-secondary uppercase tracking-wider">
        {label}
      </p>
      <motion.p
        animate={controls}
        className={`text-xl font-bold text-text-primary ${mono ? "font-mono text-sm break-all" : ""}`}
      >
        {value}
      </motion.p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-0.5 rounded text-[10px] font-medium text-text-secondary bg-background border border-border hover:bg-surface-elevated transition-colors"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const sessionId = useAppStore((s) => s.sessionId);
  const connectionStatus = useAppStore((s) => s.connectionStatus);
  const totalFrames = useAppStore((s) => s.totalFrames);
  const totalFacesDetected = useAppStore((s) => s.totalFacesDetected);
  const lastROI = useAppStore((s) => s.lastROI);
  const [showArch, setShowArch] = useState(false);

  const avgConfidence =
    lastROI !== null ? (lastROI.confidence * 100).toFixed(1) + "%" : "—";

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

  const sidebarContent = (
    <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
          Dashboard
        </h2>
        <button
          className="md:hidden p-1.5 rounded-lg text-text-secondary hover:bg-surface-elevated transition-colors"
          onClick={onClose}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {}
      <div className="p-4 rounded-xl bg-surface-elevated border border-border">
        <p className="mb-1 text-xs font-medium text-text-secondary uppercase tracking-wider">
          Session ID
        </p>
        <div className="flex items-center">
          <p className="text-xs font-mono text-text-primary truncate">
            {sessionId.slice(0, 18)}…
          </p>
          <CopyButton text={sessionId} />
        </div>
      </div>

      <StatCard label="Total Frames" value={totalFrames.toLocaleString()} />
      <StatCard label="Faces Detected" value={totalFacesDetected.toLocaleString()} />
      <StatCard label="Last Confidence" value={avgConfidence} />

      {}
      <div className="p-4 rounded-xl bg-surface-elevated border border-border">
        <p className="mb-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
          Connection
        </p>
        <div className="space-y-2 text-xs text-text-secondary font-mono">
          <div className="flex justify-between">
            <span>WebSocket</span>
            <span className="text-text-primary truncate ml-2">
              ws:
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span
              className={`font-semibold ${
                connectionStatus === "connected"
                  ? "text-accent"
                  : connectionStatus === "error"
                  ? "text-danger"
                  : "text-text-secondary"
              }`}
            >
              {connectionStatus}
            </span>
          </div>
        </div>
      </div>

      {}
      <button
        onClick={() => setShowArch(true)}
        className="mt-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        Architecture
      </button>

      {}
      <AnimatePresence>
        {showArch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowArch(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-3xl rounded-2xl bg-surface border border-border p-6 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary hover:bg-surface-elevated"
                onClick={() => setShowArch(false)}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              <h3 className="mb-4 text-lg font-semibold text-text-primary">
                System Architecture
              </h3>
              <img
                src="/architecture.svg"
                alt="Architecture Diagram"
                className="w-full rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {}
      <aside className="hidden md:block w-[280px] min-h-0 border-r border-border bg-surface overflow-y-auto">
        {sidebarContent}
      </aside>

      {}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-surface border-r border-border md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}