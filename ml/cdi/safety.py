"""
Safety detection and crisis override.

This layer is separate from the CDI calculation.
High-risk safety signals take priority over the normal
distress score.

This is a non-clinical prototype.
"""


CRISIS_THRESHOLD = 0.80


def evaluate_safety(
    imminent_risk: bool = False,
    crisis_probability: float = 0.0,
) -> dict:
    """
    Evaluate whether the safety override should activate.
    """

    crisis_probability = max(
        0.0,
        min(1.0, float(crisis_probability))
    )

    crisis_detected = (
        imminent_risk
        or crisis_probability >= CRISIS_THRESHOLD
    )

    return {
        "crisis_detected": crisis_detected,
        "imminent_risk": imminent_risk,
        "crisis_probability": round(crisis_probability, 3),
        "mode": "crisis" if crisis_detected else "normal",
    }