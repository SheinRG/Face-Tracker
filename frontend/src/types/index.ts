/** Shared TypeScript interfaces used across the frontend. */

export interface ROI {
  id: number;
  session_id: string;
  frame_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  img_width: number;
  img_height: number;
  created_at: string;
}

export interface ROIListResponse {
  items: ROI[];
  total: number;
}

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";
