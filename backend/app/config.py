"""
Central configuration for Saathi-Voice backend.

Everything that is "policy" (thresholds, weights, supported languages) lives
here so the classification logic in cdi_service.py stays a pure function of
these constants and is easy to audit / tune without touching business logic.
"""
import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = Path(os.getenv("SAATHI_UPLOAD_DIR", BASE_DIR / "uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = os.getenv("SAATHI_DB_PATH", str(BASE_DIR / "saathi_voice.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

# ---------------------------------------------------------------------------
# Runtime mode
# ---------------------------------------------------------------------------
# MOCK_MODE=1 (default) lets the full pipeline run end-to-end without any
# model weights or internet access -- useful for local dev / this sandbox.
# Set SAATHI_MOCK_MODE=0 in an environment with GPU + downloaded checkpoints
# to switch STT over to the real indicwav2vec / Whisper models.
MOCK_MODE = os.getenv("SAATHI_MOCK_MODE", "1") == "1"

# ---------------------------------------------------------------------------
# Language support (preset at session start -- never auto-detected)
# ---------------------------------------------------------------------------
# Codes map to (a) the indicwav2vec language head used for STT/acoustic
# feature extraction and (b) which keyword lexicon to load for semantic
# scoring. "hinglish" is handled with the Hindi acoustic head + a dedicated
# Hinglish (romanized code-mixed) keyword lexicon, matching the design doc.
SUPPORTED_LANGUAGES = {
    "hi": "Hindi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "ta": "Tamil",
    "hinglish": "Hindi-English (Hinglish, romanized)",
}

STT_MODEL_CHECKPOINT = os.getenv(
    "SAATHI_STT_MODEL", "ai4bharat/indicwav2vec-v1-all"
)

# ---------------------------------------------------------------------------
# CDI formula weights (must sum to 1.0)
# ---------------------------------------------------------------------------
ACOUSTIC_WEIGHT = 0.45
SEMANTIC_WEIGHT = 0.45
LONGITUDINAL_WEIGHT = 0.10

# ---------------------------------------------------------------------------
# 4-tier classification bands, exactly as specified
# ---------------------------------------------------------------------------
LEVEL_BANDS = [
    # (level, label, low, high)
    (1, "Low / Baseline Stress", 1, 3),
    (2, "Moderate / Accumulated Stress", 4, 6),
    (3, "High / Chronic Distress", 7, 8),
    (4, "Crisis / Red Alert", 9, 10),
]

SYSTEM_ACTIONS = {
    1: {
        "ai_strategy": (
            "Supportive mode: active listening, emotional validation, "
            "and light non-clinical grounding."
        ),
        "escalation": "none",
        "message": None,
        "peer_support": False,
        "human_support": False,
        "response_style": "normal",
    },

    2: {
        "ai_strategy": (
            "Coping mode: validate the user, identify the main stressor, "
            "and provide one or two small actionable coping strategies."
        ),
        "escalation": "peer_support_circle",
        "message": (
            "Would you like to connect with a moderated peer support "
            "circle with others facing similar stress?"
        ),
        "peer_support": True,
        "human_support": False,
        "response_style": "supportive",
    },

    3: {
        "ai_strategy": (
            "De-escalation mode: use short, calm, low-cognitive-load "
            "responses focused on grounding and immediate emotional support."
        ),
        "escalation": "soft_helpline_prompt",
        "message": (
            "You sound very overwhelmed right now. Would you like support "
            "from a free Tele-MANAS counselor?"
        ),
        "peer_support": False,
        "human_support": True,
        "response_style": "short_and_calm",
    },

    4: {
        "ai_strategy": (
            "Crisis mode: bypass normal conversational behavior and "
            "prioritize immediate safety and connection to human support."
        ),
        "escalation": "emergency_protocol",
        "message": (
            "Your safety is important. Please contact Tele-MANAS at "
            "14416 or 1800-89-14416 for immediate mental-health support."
        ),
        "peer_support": False,
        "human_support": True,
        "response_style": "safety_first",
    },
}

# ---------------------------------------------------------------------------
# Longitudinal tracking
# ---------------------------------------------------------------------------
LONGITUDINAL_WINDOW_DAYS = 7
# Minimum number of repeated same-stressor / high-severity sessions inside
# the window before the multiplier kicks in.
LONGITUDINAL_REPEAT_THRESHOLD = 2
