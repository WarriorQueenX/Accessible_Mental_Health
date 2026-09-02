from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SystemAction(BaseModel):
    ai_strategy: str
    escalation: str
    message: Optional[str] = None


class SessionResult(BaseModel):
    session_id: str
    user_id: str
    language: str
    transcript: Optional[str]

    acoustic_score: float = Field(..., ge=0, le=10)
    semantic_score: float = Field(..., ge=0, le=10)
    longitudinal_score: float = Field(..., ge=0, le=10)
    cdi_score: float = Field(..., ge=1, le=10)

    level: int = Field(..., ge=1, le=4)
    level_label: str
    crisis_override: bool
    matched_keywords: list[str]

    system_action: SystemAction
    created_at: datetime

    class Config:
        from_attributes = True


class SessionSummary(BaseModel):
    session_id: str
    cdi_score: float
    level: int
    level_label: str
    crisis_override: bool
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    user_id: str
    count: int
    sessions: list[SessionSummary]
    trend: str  # "improving" | "stable" | "worsening" | "insufficient_data"
