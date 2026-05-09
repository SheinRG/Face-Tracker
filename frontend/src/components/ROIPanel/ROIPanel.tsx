/** Live ROI data panel with scrollable list and animated card entries. */

import { AnimatePresence, motion } from "framer-motion";
import { useROIData } from "../../hooks/useROIData";
import { useAppStore } from "../../store/useAppStore";
import { ROICard } from "./ROICard";
import { useEffect, useRef } from "react";

export function ROIPanel() {
  const { data, isLoading } = useROIData(50);
  const connectionStatus = useAppStore((s) => s.connectionStatus);
  const setLastROI = useAppStore((s) => s.setLastROI);
  const setFacesDetected = useAppStore((s) => s.setTotalFacesDetected);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const prevTotalRef = useRef(0);

  // Update last ROI and face count in store — use ref to avoid infinite loop
  useEffect(() => {
    if (items.length > 0) {
      setLastROI(items[0]);
    }
  }, [items, setLastROI]);

  useEffect(() => {
    if (total !== prevTotalRef.current) {
      prevTotalRef.current = total;
      setFacesDetected(total);
    }
  }, [total, setFacesDetected]);

  return (
    <div className="flex flex-col w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
          ROI Stream
        </h2>
        <AnimatePresence mode="wait">
          <motion.span
            key={total}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono text-accent bg-accent/10 border border-accent/20"
          >
            {total}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Scrollable list */}
      <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
        {connectionStatus !== "connected" && items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-text-secondary">
            <svg
              className="w-10 h-10 opacity-30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs">Waiting for detections…</p>
          </div>
        )}

        {isLoading && items.length === 0 && connectionStatus === "connected" && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {items.map((roi) => (
            <ROICard key={roi.id} roi={roi} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
