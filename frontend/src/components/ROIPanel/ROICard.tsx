
import { motion } from "framer-motion";
import type { ROI } from "../../types";
import { ConfidenceBar } from "./ConfidenceBar";

interface ROICardProps {
  roi: ROI;
}

export function ROICard({ roi }: ROICardProps) {
  const timestamp = new Date(roi.created_at).toLocaleTimeString();

  return (
    <motion.div
      layout
      layoutId={`roi-${roi.id}`}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="p-3 rounded-xl bg-surface-elevated border border-border"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-bold text-accent">
          #{roi.frame_number}
        </span>
        <span className="text-[10px] text-text-secondary">{timestamp}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2 text-xs">
        <div className="flex justify-between">
          <span className="text-text-secondary">x</span>
          <span className="font-mono text-text-primary">{roi.x.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">y</span>
          <span className="font-mono text-text-primary">{roi.y.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">w</span>
          <span className="font-mono text-text-primary">{roi.width.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">h</span>
          <span className="font-mono text-text-primary">{roi.height.toFixed(1)}</span>
        </div>
      </div>

      <ConfidenceBar confidence={roi.confidence} />
    </motion.div>
  );
}