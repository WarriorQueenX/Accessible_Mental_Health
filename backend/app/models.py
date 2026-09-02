import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class StressSession(Base):
    """One analyzed audio submission and its resulting CDI/level."""

    __tablename__ = "stress_sessions"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, index=True, nullable=False)
    language = Column(String, nullable=False)

    audio_path = Column(String, nullable=False)
    transcript = Column(String, nullable=True)

    acoustic_score = Column(Float, nullable=False)
    semantic_score = Column(Float, nullable=False)
    longitudinal_score = Column(Float, nullable=False)
    cdi_score = Column(Float, nullable=False)

    level = Column(Integer, nullable=False)
    level_label = Column(String, nullable=False)

    crisis_override = Column(Boolean, default=False, nullable=False)
    matched_keywords = Column(JSON, default=list)
    acoustic_features = Column(JSON, default=dict)

    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )
