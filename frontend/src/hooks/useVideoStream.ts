
import { useCallback, useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore";

const FRAME_INTERVAL_MS = 66; 
const CAPTURE_WIDTH = 640;
const CAPTURE_HEIGHT = 480;

export function useVideoStream() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameCountRef = useRef(0);
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sessionId = useAppStore((s) => s.sessionId);
  const setConnectionStatus = useAppStore((s) => s.setConnectionStatus);
  const setFps = useAppStore((s) => s.setFps);
  const incrementFrames = useAppStore((s) => s.incrementFrames);

  const stopStream = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (fpsIntervalRef.current) {
      clearInterval(fpsIntervalRef.current);
      fpsIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setConnectionStatus("disconnected");
    setFps(0);
  }, [setConnectionStatus, setFps]);

  const startStream = useCallback(async () => {
    try {
      setConnectionStatus("connecting");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT },
      });
      mediaStreamRef.current = stream;

      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      videoRef.current = video;

      const captureCanvas = document.createElement("canvas");
      captureCanvas.width = CAPTURE_WIDTH;
      captureCanvas.height = CAPTURE_HEIGHT;
      captureCanvasRef.current = captureCanvas;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/video/ws/${sessionId}`;

      const ws = new WebSocket(wsUrl);
      ws.binaryType = "blob";
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("connected");

        intervalRef.current = setInterval(() => {
          if (!videoRef.current || !captureCanvasRef.current || !wsRef.current) return;
          if (wsRef.current.readyState !== WebSocket.OPEN) return;

          const ctx = captureCanvasRef.current.getContext("2d");
          if (!ctx) return;

          ctx.drawImage(videoRef.current, 0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT);
          captureCanvasRef.current.toBlob(
            (blob) => {
              if (blob && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(blob);
                incrementFrames();
              }
            },
            "image/jpeg",
            0.7
          );
        }, FRAME_INTERVAL_MS);

        frameCountRef.current = 0;
        fpsIntervalRef.current = setInterval(() => {
          setFps(frameCountRef.current);
          frameCountRef.current = 0;
        }, 1000);
      };

      ws.onmessage = async (event: MessageEvent) => {
        frameCountRef.current += 1;

        const blob = event.data as Blob;
        try {
          const bitmap = await createImageBitmap(blob);
          const displayCanvas = canvasRef.current;
          if (!displayCanvas) return;

          const ctx = displayCanvas.getContext("2d");
          if (!ctx) return;

          displayCanvas.width = bitmap.width;
          displayCanvas.height = bitmap.height;
          ctx.drawImage(bitmap, 0, 0);
          bitmap.close();
        } catch (err) {
          console.error("Failed to render frame:", err);
        }
      };

      ws.onclose = () => {
        setConnectionStatus("disconnected");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

      ws.onerror = () => {
        setConnectionStatus("error");
      };
    } catch (err) {
      console.error("Failed to start stream:", err);
      setConnectionStatus("error");
    }
  }, [sessionId, setConnectionStatus, setFps, incrementFrames]);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return { canvasRef, startStream, stopStream };
}