
from __future__ import annotations

import uuid
from typing import Generic, List, Optional, Type, TypeVar
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T]):
    def __init__(self, db: AsyncSession, model: Type[T]) -> None:
        self.db = db
        self.model = model

    async def get(self, id: uuid.UUID | str) -> Optional[T]:
        """Fetch single record by primary key (UUID)."""
        if isinstance(id, str):
            id = uuid.UUID(id)
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()

    async def get_all(self, limit: int = 100) -> List[T]:
        result = await self.db.execute(select(self.model).limit(limit))
        return list(result.scalars().all())

    async def create(self, **kwargs) -> T:
        """Create and persist a new record. Returns the new ORM object."""
        if "id" not in kwargs:
            kwargs["id"] = uuid.uuid4()
        instance = self.model(**kwargs)
        self.db.add(instance)
        await self.db.flush()   # Get DB-generated defaults without committing
        return instance

    async def update(self, id: uuid.UUID | str, **kwargs) -> Optional[T]:
        """Update fields of an existing record."""
        instance = await self.get(id)
        if instance is None:
            return None
        for key, value in kwargs.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        await self.db.flush()
        return instance

    async def delete(self, id: uuid.UUID | str) -> bool:
        instance = await self.get(id)
        if instance is None:
            return False
        await self.db.delete(instance)
        await self.db.flush()
        return True
