"""Face detection service using MediaPipe Tasks API and Pillow — zero OpenCV dependency."""

import asyncio
import functools
import os
from io import BytesIO
from typing import Optional

import numpy as np
from PIL import Image, ImageDraw
import mediapipe as mp  # type: ignore[import-untyped]

# Resolve model path relative to this file
_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "blaze_face_short_range.tflite",
)


class FaceDetector:
    """Wraps MediaPipe Tasks FaceDetector for single-face bounding-box extraction."""

    _BOX_COLOR = (34, 197, 94)  # Tailwind green-500
    _BOX_WIDTH = 3

    def __init__(self) -> None:
        base_options = mp.tasks.BaseOptions(model_asset_path=_MODEL_PATH)
        options = mp.tasks.vision.FaceDetectorOptions(
            base_options=base_options,
            min_detection_confidence=0.5,
        )
        self._detector = mp.tasks.vision.FaceDetector.create_from_options(options)

    def _detect_sync(self, frame_bytes: bytes) -> tuple[Optional[dict], bytes]:
        """Synchronous face detection — runs in thread executor.

        Args:
            frame_bytes: Raw JPEG bytes from the client.

        Returns:
            Tuple of (roi_dict | None, annotated_jpeg_bytes).
        """
        image = Image.open(BytesIO(frame_bytes)).convert("RGB")
        img_width, img_height = image.size

        # Convert PIL to MediaPipe Image via numpy
        rgb_array = np.array(image)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_array)

        # Run detection
        result = self._detector.detect(mp_image)

        if not result.detections:
            buf = BytesIO()
            image.save(buf, format="JPEG", quality=85)
            return None, buf.getvalue()

        detection = result.detections[0]
        bbox = detection.bounding_box
        confidence = detection.categories[0].score

        # bbox fields: origin_x, origin_y, width, height (absolute pixels)
        abs_x = max(0.0, float(bbox.origin_x))
        abs_y = max(0.0, float(bbox.origin_y))
        abs_w = min(float(bbox.width), img_width - abs_x)
        abs_h = min(float(bbox.height), img_height - abs_y)

        roi_dict = {
            "x": round(abs_x, 2),
            "y": round(abs_y, 2),
            "width": round(abs_w, 2),
            "height": round(abs_h, 2),
            "confidence": round(float(confidence), 4),
            "img_width": img_width,
            "img_height": img_height,
        }

        # Draw bounding box on the PIL image
        draw = ImageDraw.Draw(image)
        x1 = abs_x
        y1 = abs_y
        x2 = abs_x + abs_w
        y2 = abs_y + abs_h
        draw.rectangle(
            [x1, y1, x2, y2],
            outline=self._BOX_COLOR,
            width=self._BOX_WIDTH,
        )

        # Encode annotated frame to JPEG
        buf = BytesIO()
        image.save(buf, format="JPEG", quality=85)
        return roi_dict, buf.getvalue()

    async def detect(self, frame_bytes: bytes) -> tuple[Optional[dict], bytes]:
        """Async wrapper — offloads CPU-bound detection to a thread executor."""
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            None,
            functools.partial(self._detect_sync, frame_bytes),
        )


# Module-level singleton — reused across all requests
face_detector = FaceDetector()
