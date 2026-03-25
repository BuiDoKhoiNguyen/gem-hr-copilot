"""
DB base — DeclarativeBase shared by all domain models.
Import this in each domain model file.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
