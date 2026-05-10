
import { create } from "zustand";
import type { ConnectionStatus, ROI } from "../types";

interface AppState {
  sessionId: string;
  connectionStatus: ConnectionStatus;
  fps: number;
  totalFrames: number;
  totalFacesDetected: number;
  lastROI: ROI | null;
  setConnectionStatus: (s: ConnectionStatus) => void;
  setFps: (n: number) => void;
  incrementFrames: () => void;
  incrementFaces: () => void;
  setTotalFacesDetected: (n: number) => void;
  setLastROI: (roi: ROI | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sessionId: crypto.randomUUID(),
  connectionStatus: "idle",
  fps: 0,
  totalFrames: 0,
  totalFacesDetected: 0,
  lastROI: null,
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setFps: (fps) => set({ fps }),
  incrementFrames: () =>
    set((state) => ({ totalFrames: state.totalFrames + 1 })),
  incrementFaces: () =>
    set((state) => ({ totalFacesDetected: state.totalFacesDetected + 1 })),
  setTotalFacesDetected: (totalFacesDetected) => set({ totalFacesDetected }),
  setLastROI: (lastROI) => set({ lastROI }),
}));