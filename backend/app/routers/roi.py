
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.roi import ROIRecord
from app.schemas.roi import ROIListResponse, ROIResponse

router = APIRouter(prefix="/roi", tags=["roi"])

@router.get("/", response_model=ROIListResponse)
async def get_roi_data(
    response: Response,
    session_id: str = Query(..., description="Browser session UUID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> ROIListResponse:
    
    count_stmt = (
        select(func.count())
        .select_from(ROIRecord)
        .where(ROIRecord.session_id == session_id)
    )
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    records_stmt = (
        select(ROIRecord)
        .where(ROIRecord.session_id == session_id)
        .order_by(ROIRecord.frame_number.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(records_stmt)
    records = result.scalars().all()

    response.headers["X-Total-Count"] = str(total)

    return ROIListResponse(
        items=[ROIResponse.model_validate(r) for r in records],
        total=total,
    )