"""
Main CDI assessment engine.

Combines:
- Acoustic distress
- Semantic distress
- Longitudinal history
- Safety detection
"""

from .fusion import calculate_cdi
from .response_policy import get_response_policy
from .safety import evaluate_safety


def assess_user(
    acoustic_score: float,
    semantic_score: float,
    history_score: float,
    imminent_risk: bool = False,
    crisis_probability: float = 0.0,
) -> dict:

    # Check safety first
    safety = evaluate_safety(
        imminent_risk=imminent_risk,
        crisis_probability=crisis_probability,
    )

    # Calculate CDI
    cdi_result = calculate_cdi(
        acoustic_score=acoustic_score,
        semantic_score=semantic_score,
        history_score=history_score,
    )

    # Safety override
    if safety["crisis_detected"]:
        level = 4
    else:
        level = cdi_result["level"]

    # Get response policy
    policy = get_response_policy(level)

    return {
        "cdi": cdi_result["cdi"],
        "level": level,
        "label": policy["label"],
        "response_mode": policy["mode"],

        "scores": {
            "acoustic": cdi_result["acoustic_score"],
            "semantic": cdi_result["semantic_score"],
            "history": cdi_result["history_score"],
        },

        "safety": safety,

        "response_policy": policy,
    }