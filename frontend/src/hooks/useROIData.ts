/** Custom hook: polls ROI data from the backend using React Query. */

import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "../store/useAppStore";
import type { ROIListResponse } from "../types";

async function fetchROIData(
  sessionId: string,
  limit: number
): Promise<ROIListResponse> {
  const host = window.location.hostname;
  const port = "8000";
  const url = `http://${host}:${port}/roi/?session_id=${sessionId}&limit=${limit}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ROI fetch failed: ${response.status}`);
  }
  return response.json() as Promise<ROIListResponse>;
}

export function useROIData(limit = 20) {
  const sessionId = useAppStore((s) => s.sessionId);
  const connectionStatus = useAppStore((s) => s.connectionStatus);

  return useQuery<ROIListResponse>({
    queryKey: ["roi", sessionId, limit],
    queryFn: () => fetchROIData(sessionId, limit),
    refetchInterval: 2000,
    enabled: connectionStatus === "connected",
  });
}
