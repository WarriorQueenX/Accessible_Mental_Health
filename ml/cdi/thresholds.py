"""
CDI (Composite Distress Index) thresholds.

CDI is a prototype, non-clinical support-routing score.
It must not be treated as a diagnosis.
"""

LOW_MAX = 3
MODERATE_MAX = 6
HIGH_MAX = 8
CRISIS_MIN = 9


def get_level(cdi: int) -> int:
    """Convert a CDI score (1-10) into a support level."""

    if cdi <= LOW_MAX:
        return 1

    if cdi <= MODERATE_MAX:
        return 2

    if cdi <= HIGH_MAX:
        return 3

    return 4
