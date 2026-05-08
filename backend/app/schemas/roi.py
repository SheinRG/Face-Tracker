"""Pydantic v2 schemas for ROI data serialisation."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ROIResponse(BaseModel):
    """Single ROI detection record returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: str
    frame_number: int
    x: float
    y: float
    width: float
    height: float
    confidence: float
    img_width: int
    img_height: int
    created_at: datetime


class ROIListResponse(BaseModel):
    """Paginated list of ROI records."""

    items: list[ROIResponse]
    total: int
