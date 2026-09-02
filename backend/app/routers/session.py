from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session as DBSession

from app.config import SUPPORTED_LANGUAGES
from app.database import get_db
from app.models import StressSession
from app.schemas import HistoryResponse, SessionResult, SessionSummary, SystemAction
from app.services.pipeline import PipelineError, run_pipeline

router = APIRouter(prefix="/api/v1/sessions", tags=["sessions"])

MAX_AUDIO_BYTES = 15 * 1024 * 1024  # 15MB -- generous for a WhatsApp voice note


def _to_result(row: StressSession) -> SessionResult:
    action_dict = _system_action_for_level(row.level)
    return SessionResult(
        session_id=row.id,
        user_id=row.user_id,
        language=row.language,
        transcript=row.transcript,
        acoustic_score=row.acoustic_score,
        semantic_score=row.semantic_score,
        longitudinal_score=row.longitudinal_score,
        cdi_score=row.cdi_score,
        level=row.level,
        level_label=row.level_label,
        crisis_override=row.crisis_override,
        matched_keywords=row.matched_keywords or [],
        system_action=SystemAction(**action_dict),
        created_at=row.created_at,
    )


def _system_action_for_level(level: int) -> dict:
    from app.config import SYSTEM_ACTIONS
    return SYSTEM_ACTIONS[level]


@router.post("/analyze", response_model=SessionResult)
async def analyze_audio(
    user_id: str = Form(..., description="Stable user/session identifier"),
    language: str = Form(
        ..., description=f"Preset language code, one of {list(SUPPORTED_LANGUAGES)}"
    ),
    audio: UploadFile = File(...),
    db: DBSession = Depends(get_db),
):
    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported language '{language}'. Choose one of "
            f"{list(SUPPORTED_LANGUAGES)}.",
        )

    raw_bytes = await audio.read()
    if not raw_bytes:
        raise HTTPException(status_code=422, detail="Empty audio upload.")
    if len(raw_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file too large.")

    try:
        row = run_pipeline(
            db=db,
            user_id=user_id,
            language=language,
            filename=audio.filename or "voice_note.wav",
            raw_bytes=raw_bytes,
        )
    except PipelineError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        # Never leak stack traces for a mental-health-sensitive endpoint --
        # log server-side (left as a hook) and return a generic message.
        raise HTTPException(
            status_code=500, detail="Audio analysis failed. Please try again."
        ) from exc

    return _to_result(row)


@router.get("/{session_id}", response_model=SessionResult)
def get_session(session_id: str, db: DBSession = Depends(get_db)):
    row = db.query(StressSession).filter(StressSession.id == session_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Session not found.")
    return _to_result(row)


@router.get("/user/{user_id}/history", response_model=HistoryResponse)
def get_history(user_id: str, limit: int = 30, db: DBSession = Depends(get_db)):
    rows = (
        db.query(StressSession)
        .filter(StressSession.user_id == user_id)
        .order_by(StressSession.created_at.desc())
        .limit(limit)
        .all()
    )
    summaries = [SessionSummary.model_validate(r) for r in rows]

    trend = "insufficient_data"
    if len(rows) >= 2:
        chronological = list(reversed(rows))  # oldest -> newest
        half = len(chronological) // 2
        first_half_avg = sum(r.cdi_score for r in chronological[:half or 1]) / (half or 1)
        second_half_avg = sum(r.cdi_score for r in chronological[half:]) / (
            len(chronological) - half
        )
        delta = second_half_avg - first_half_avg
        if delta > 0.5:
            trend = "worsening"
        elif delta < -0.5:
            trend = "improving"
        else:
            trend = "stable"

    return HistoryResponse(
        user_id=user_id, count=len(summaries), sessions=summaries, trend=trend
    )
