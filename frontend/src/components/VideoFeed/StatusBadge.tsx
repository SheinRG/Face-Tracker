/** Animated connection status indicator — pulsing dot with label. */

import { motion } from "framer-motion";
import type { ConnectionStatus } from "../../types";

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { color: string; bg: string; label: string }
> = {
  idle: { color: "bg-text-secondary", bg: "bg-text-secondary/10", label: "Idle" },
  connecting: { color: "bg-warning", bg: "bg-warning/10", label: "Connecting" },
  connected: { color: "bg-accent", bg: "bg-accent/10", label: "Live" },
  disconnected: { color: "bg-danger", bg: "bg-danger/10", label: "Disconnected" },
  error: { color: "bg-danger", bg: "bg-danger/10", label: "Error" },
};

interface StatusBadgeProps {
  status: ConnectionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const isConnected = status === "connected";

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg}`}
    >
      {isConnected ? (
        <motion.span
          className={`inline-block w-2 h-2 rounded-full ${config.color}`}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      ) : (
        <motion.span
          className={`inline-block w-2 h-2 rounded-full ${config.color}`}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <span className="text-text-primary">{config.label}</span>
    </div>
  );
}
