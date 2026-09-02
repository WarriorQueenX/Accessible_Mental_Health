"""
Composite Distress Index (CDI) fusion + 4-tier classification.

CDI = 0.4*Acoustic + 0.4*Semantic + 0.2*Longitudinal   (each term on 1-10)

The Longitudinal term is derived from the *pattern alert* rule in the design
doc ("boosts the base score +1 to +2 points if repeating high-stress
indicators are detected over the past 7 days"). To fit it into the weighted
formula rather than as an ad-hoc post-hoc addition: a repeat-pattern hit
maps to a longitudinal score of 5 (0.2 * 5 = +1) or 10 (0.2 * 10 = +2)
depending on how many repeats were found, and 0 otherwise (no boost).

A hard safety override always applies: an explicit Level-4 crisis keyword
hit forces the Level 4 / Crisis band regardless of the composite arithmetic,
per "Immediate Override: the standard Conversational LLM is instantly
bypassed" -- this must never be softened by averaging with other scores.
"""
from dataclasses import dataclass

from app.config import (
    ACOUSTIC_WEIGHT,
    SEMANTIC_WEIGHT,
    LONGITUDINAL_WEIGHT,
    LEVEL_BANDS,
    SYSTEM_ACTIONS,
    LONGITUDINAL_REPEAT_THRESHOLD,
)


@dataclass
class ClassificationResult:
    cdi_score: float
    longitudinal_score: float
    level: int
    level_label: str
    crisis_override: bool
    system_action: dict


def compute_longitudinal_score(repeat_count: int) -> float:
    """
    repeat_count = number of prior sessions in the trailing window that
    (a) scored Level 2+ and (b) shared a matched keyword/stressor tier with
    the current session. See pipeline.py for how this is counted.
    """
    if repeat_count <= 0:
        return 0.0
    if repeat_count == 1:
        return 0.0  # doc requires *repeated* mentions -- one prior isn't enough
    if repeat_count < LONGITUDINAL_REPEAT_THRESHOLD + 2:
        return 5.0   # -> +1 point boost when weighted
    return 10.0      # -> +2 point boost when weighted


def classify_level(cdi_score: float) -> tuple[int, str]:
    for level, label, low, high in LEVEL_BANDS:
        if low <= cdi_score <= high:
            return level, label
    # cdi_score is clamped to [1, 10] before this is called, so we should
    # never fall through -- but fail safe toward the highest concern band.
    return 4, "Crisis / Red Alert"


def compute_cdi(
    acoustic_score: float,
    semantic_score: float,
    longitudinal_repeat_count: int,
    crisis_hit: bool,
) -> ClassificationResult:
    longitudinal_score = compute_longitudinal_score(longitudinal_repeat_count)

    raw_cdi = (
        ACOUSTIC_WEIGHT * acoustic_score
        + SEMANTIC_WEIGHT * semantic_score
        + LONGITUDINAL_WEIGHT * longitudinal_score
    )
    cdi_score = round(min(10.0, max(1.0, raw_cdi)), 2)

    level, label = classify_level(cdi_score)

    crisis_override = False
    if crisis_hit:
        # Hard safety floor: never let a crisis keyword hit resolve to
        # anything below the Crisis band, no matter what the other two
        # signals said.
        crisis_override = True
        level, label = 4, "Crisis / Red Alert"
        cdi_score = max(cdi_score, 9.0)

    return ClassificationResult(
        cdi_score=cdi_score,
        longitudinal_score=longitudinal_score,
        level=level,
        level_label=label,
        crisis_override=crisis_override,
        system_action=SYSTEM_ACTIONS[level],
    )
