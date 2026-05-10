
from datetime import datetime

from pydantic import BaseModel, ConfigDict

class ROIResponse(BaseModel):
    
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
    
    items: list[ROIResponse]
    total: int