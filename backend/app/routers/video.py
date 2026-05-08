"""Video streaming router — WebSocket ingest and MJPEG output."""

import asyncio
import logging
from typing import Dict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

from app.database import AsyncSessionLocal
from app.models.roi import ROIRecord
from app.services.face_detection import face_detector

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/video", tags=["video"])

# In-memory store of the latest annotated frame per session
_latest_frames: Dict[str, bytes] = {}

# Per-session frame counters
_frame_counters: Dict[str, int] = {}


@router.websocket("/ws/{session_id}")
async def video_websocket(websocket: WebSocket, session_id: str) -> None:
    """Accept webcam frames via WebSocket, detect faces, return annotated frames."""
    await websocket.accept()
    _frame_counters[session_id] = 0
    logger.info("WebSocket connected: session=%s", session_id)

    try:
        while True:
            frame_bytes = await websocket.receive_bytes()
            _frame_counters[session_id] = _frame_counters.get(session_id, 0) + 1
            frame_number = _frame_counters[session_id]

            try:
                roi_dict, annotated_bytes = await face_detector.detect(frame_bytes)
            except Exception as detect_err:
                logger.error("Detection error frame=%d: %s", frame_number, detect_err)
                await websocket.send_bytes(frame_bytes)
                continue

            _latest_frames[session_id] = annotated_bytes

            if roi_dict is not None:
                try:
                    async with AsyncSessionLocal() as db:
                        record = ROIRecord(
                            session_id=session_id,
                            frame_number=frame_number,
                            x=roi_dict["x"],
                            y=roi_dict["y"],
                            width=roi_dict["width"],
                            height=roi_dict["height"],
                            confidence=roi_dict["confidence"],
                            img_width=roi_dict["img_width"],
                            img_height=roi_dict["img_height"],
                        )
                        db.add(record)
                        await db.commit()
                except Exception as db_err:
                    logger.error("DB commit error: %s", db_err)

            await websocket.send_bytes(annotated_bytes)

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected: session=%s", session_id)
    except Exception as exc:
        logger.error("WebSocket error session=%s: %s", session_id, exc)
    finally:
        _latest_frames.pop(session_id, None)
        _frame_counters.pop(session_id, None)


async def _mjpeg_generator(session_id: str):
    """Yield MJPEG frames for the given session at ~15 fps."""
    while True:
        frame = _latest_frames.get(session_id)
        if frame is not None:
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            )
        await asyncio.sleep(0.066)


@router.get("/stream/{session_id}")
async def video_stream(session_id: str) -> StreamingResponse:
    """Serve the latest annotated frame for a session as an MJPEG stream."""
    return StreamingResponse(
        _mjpeg_generator(session_id),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )
