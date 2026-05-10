
import { motion } from "framer-motion";

interface ConfidenceBarProps {
  confidence: number;
}

function getBarColor(confidence: number): string {
  if (confidence < 0.6) return "#ef4444"; 
  if (confidence < 0.8) return "#f59e0b"; 
  return "#22c55e"; 
}

export function ConfidenceBar({ confidence }: ConfidenceBarProps) {
  const color = getBarColor(confidence);
  const pct = Math.min(100, Math.max(0, confidence * 100));

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-background overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          animate={{
            width: `${pct}%`,
            backgroundColor: color,
          }}
          transition={{
            width: { type: "spring", stiffness: 120, damping: 20 },
            backgroundColor: { duration: 0.3 },
          }}
        />
      </div>
      <span className="text-[10px] font-mono font-bold text-text-secondary w-10 text-right">
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}