from typing import Generator, Optional
from fastapi import Depends, Header, HTTPException
import uuid
import re
from sqlmodel import Session, create_engine, SQLModel
from .config import settings

def get_session_id(x_session_id: Optional[str] = Header(None)) -> str:
    """Extract and validate session ID from X-Session-ID header.
    
    Accepts both standard UUID v4 and legacy sess_<timestamp>_<random> formats.
    """
    if not x_session_id:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "VALIDATION_ERROR",
                "message": "X-Session-ID header is required",
                "details": {}
            }
        )

    # Accept standard UUID v4 format
    try:
        uuid.UUID(x_session_id)
        return x_session_id
    except ValueError:
        pass

    # Accept legacy frontend format: sess_<timestamp>_<random>
    if re.match(r'^sess_\d+_[a-z0-9]+$', x_session_id):
        return x_session_id

    raise HTTPException(
        status_code=400,
        detail={
            "code": "VALIDATION_ERROR",
            "message": "X-Session-ID must be a valid UUID or session token",
            "details": {}
        }
    )

def get_db() -> Generator[Session, None, None]:
    """Database session dependency"""
    engine = create_engine(settings.DATABASE_URL, echo=False)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
