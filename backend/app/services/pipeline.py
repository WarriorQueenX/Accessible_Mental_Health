"""
End-to-end orchestration for a single audio submission.

Flow:
  1. Persist the uploaded audio to disk.
  2. STT -> transcript (preset language, never auto-detected).
  3. Acoustic analysis on the raw waveform -> acoustic_score.
  4. Semantic analysis on the transcript -> semantic_score + keyword hits.
  5. Longitudinal check against this user's last N days of sessions.
  6. Fuse into CDI, classify into the 4 levels, apply crisis override.
  7. Persist the StressSession row and return it.
"""
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy.orm import Session as DBSession

from app.config import UPLOAD_DIR, LONGITUDINAL_WINDOW_DAYS
from app.models import StressSession
from app.services import stt_service, acoustic_service, semantic_service, cdi_service


class PipelineError(Exception):
    pass


def _save_upload(user_id: str, filename: str, raw_bytes: bytes) -> Path:
    ext = Path(filename).suffix or ".wav"
    dest = UPLOAD_DIR / f"{user_id}_{uuid.uuid4().hex}{ext}"
    dest.write_bytes(raw_bytes)
    return dest


def _count_longitudinal_repeats(
    db: DBSession, user_id: str, current_keywords: list[str]
) -> int:
    """
    Counts prior sessions in the trailing window that were Level 2+ and
    shared at least one matched keyword/stressor with the current session
    -- i.e. "the same issue keeps coming up", per the design doc's pattern
    alert rule.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=LONGITUDINAL_WINDOW_DAYS)
    recent = (
        db.query(StressSession)
        .filter(
            StressSession.user_id == user_id,
            StressSession.created_at >= cutoff,
            StressSession.level >= 2,
        )
        .all()
    )
    if not current_keywords:
        # No specific stressor identified this time -- fall back to a
        # coarser "how many high-stress sessions recently" count.
        return sum(1 for s in recent if s.level >= 2)

    current_set = set(k.lower() for k in current_keywords)
    repeats = 0
    for s in recent:
        past_keywords = set(k.lower() for k in (s.matched_keywords or []))
        if current_set & past_keywords:
            repeats += 1
    return repeats


def run_pipeline(
    db: DBSession,
    user_id: str,
    language: str,
    filename: str,
    raw_bytes: bytes,
) -> StressSession:
    audio_path = _save_upload(user_id, filename, raw_bytes)

    try:
        transcript = stt_service.transcribe(str(audio_path), language)
        acoustic_score, acoustic_features = acoustic_service.analyze(str(audio_path))
        semantic_result = semantic_service.analyze(transcript, language)

        repeat_count = _count_longitudinal_repeats(
            db, user_id, semantic_result.matched_keywords
        )

        classification = cdi_service.compute_cdi(
            acoustic_score=acoustic_score,
            semantic_score=semantic_result.score,
            longitudinal_repeat_count=repeat_count,
            crisis_hit=semantic_result.crisis_hit,
        )
    except stt_service.UnsupportedLanguageError as exc:
        raise PipelineError(str(exc)) from exc

    session_row = StressSession(
        user_id=user_id,
        language=language,
        audio_path=str(audio_path),
        transcript=transcript,
        acoustic_score=acoustic_score,
        semantic_score=semantic_result.score,
        longitudinal_score=classification.longitudinal_score,
        cdi_score=classification.cdi_score,
        level=classification.level,
        level_label=classification.level_label,
        crisis_override=classification.crisis_override,
        matched_keywords=semantic_result.matched_keywords,
        acoustic_features=acoustic_features,
    )
    db.add(session_row)
    db.commit()
    db.refresh(session_row)
    return session_row
