
import { motion, AnimatePresence } from "framer-motion";
import { useVideoStream } from "../../hooks/useVideoStream";
import { useAppStore } from "../../store/useAppStore";
import { StatusBadge } from "./StatusBadge";
import { FPSCounter } from "./FPSCounter";

export function VideoFeed() {
  const { canvasRef, startStream, stopStream } = useVideoStream();
  const connectionStatus = useAppStore((s) => s.connectionStatus);
  const sessionId = useAppStore((s) => s.sessionId);
  const totalFrames = useAppStore((s) => s.totalFrames);
  const totalFacesDetected = useAppStore((s) => s.totalFacesDetected);
  const lastROI = useAppStore((s) => s.lastROI);

  const isStreaming =
    connectionStatus === "connected" || connectionStatus === "connecting";

  return (
    <div className="flex flex-col gap-4">
      {}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={
          connectionStatus === "connected"
            ? { scale: 1, opacity: 1 }
            : { scale: 0.96, opacity: connectionStatus === "idle" ? 1 : 0.85 }
        }
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative w-full max-w-[640px] aspect-[4/3] rounded-2xl overflow-hidden bg-surface-elevated border border-border"
      >
        {}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain bg-black"
          width={640}
          height={480}
        />

        {}
        <div className="absolute top-3 left-3">
          <StatusBadge status={connectionStatus} />
        </div>
        <div className="absolute top-3 right-3">
          <FPSCounter />
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono text-text-secondary bg-background/70 backdrop-blur-sm border border-border">
            {sessionId.slice(0, 8)}
          </span>
        </div>

        {}
        <AnimatePresence>
          {connectionStatus === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface-elevated/90 backdrop-blur-sm"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20">
                <svg
                  className="w-8 h-8 text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <p className="text-sm text-text-secondary">Webcam preview will appear here</p>
              <button
                onClick={startStream}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-background bg-accent hover:bg-accent-dim transition-colors shadow-lg shadow-accent/20"
              >
                Start Camera
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <AnimatePresence>
          {connectionStatus === "disconnected" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-danger/10 border border-danger/30">
                <svg className="w-7 h-7 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                  <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
              </div>
              <p className="text-sm font-medium text-text-primary">Connection Lost</p>
              <button
                onClick={startStream}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-background bg-accent hover:bg-accent-dim transition-colors"
              >
                Reconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <AnimatePresence>
          {connectionStatus === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm"
            >
              <p className="text-sm font-medium text-danger">Connection Error</p>
              <button
                onClick={startStream}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-background bg-accent hover:bg-accent-dim transition-colors"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {}
      {isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={stopStream}
            className="px-4 py-2 rounded-xl text-sm font-medium text-danger bg-danger/10 border border-danger/20 hover:bg-danger/20 transition-colors"
          >
            Stop Camera
          </button>
        </motion.div>
      )}

      {}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border text-xs">
          <span className="text-text-secondary">Frames</span>
          <span className="font-mono font-bold text-text-primary">
            {totalFrames.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border text-xs">
          <span className="text-text-secondary">Faces</span>
          <span className="font-mono font-bold text-accent">
            {totalFacesDetected.toLocaleString()}
          </span>
        </div>
        {lastROI && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border text-xs">
            <span className="text-text-secondary">Confidence</span>
            <span className="font-mono font-bold text-accent">
              {(lastROI.confidence * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}