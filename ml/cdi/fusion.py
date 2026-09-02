"""
Composite Distress Index (CDI) fusion engine.

Combines:
- Acoustic distress score
- Semantic/text distress score
- Longitudinal/history score

This is a prototype, non-clinical support-routing mechanism.
It is NOT a medical diagnosis.
"""

from .thresholds import get_level


def clamp_score(score: float) -> float:
    """Keep a score within the valid 1-10 range."""
    return max(1.0, min(10.0, float(score)))


def calculate_cdi(
    acoustic_score: float,
    semantic_score: float,
    history_score: float,
) -> dict:
    """
    Calculate the Composite Distress Index.

    Weights:
        Acoustic  = 45%
        Semantic  = 45%
        History   = 10%

    Returns a dictionary containing CDI and level information.
    """

    acoustic = clamp_score(acoustic_score)
    semantic = clamp_score(semantic_score)
    history = clamp_score(history_score)

    cdi = (
        0.45 * acoustic
        + 0.45 * semantic
        + 0.10 * history
    )

    cdi = round(clamp_score(cdi), 1)

    level = get_level(round(cdi))

    labels = {
        1: "Low",
        2: "Moderate",
        3: "High",
        4: "Crisis",
    }

    return {
        "cdi": cdi,
        "level": level,
        "label": labels[level],
        "acoustic_score": acoustic,
        "semantic_score": semantic,
        "history_score": history,
    }