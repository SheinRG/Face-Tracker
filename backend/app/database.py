"""Async SQLAlchemy engine, session factory, and dependency injection helper."""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

engine = create_async_engine(
    settings.database_url_resolved,
    echo=False,
    pool_size=5 if "sqlite" not in settings.database_url_resolved else 0,
    max_overflow=10 if "sqlite" not in settings.database_url_resolved else 0,
    **({"pool_pre_ping": True} if "sqlite" not in settings.database_url_resolved else {}),
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


async def get_db() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency that yields an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
