"""
Response policy for CDI support levels.

This maps a distress level to the behavior the application should use.

This is a non-clinical support-routing prototype.
"""


RESPONSE_POLICIES = {
    1: {
        "label": "Low",
        "mode": "supportive",
        "response_style": "normal",
        "actions": [
            "active_listening",
            "validation",
            "light_grounding",
        ],
        "peer_support": False,
        "human_support": False,
    },

    2: {
        "label": "Moderate",
        "mode": "coping",
        "response_style": "supportive",
        "actions": [
            "validation",
            "identify_stressor",
            "micro_coping",
        ],
        "peer_support": True,
        "human_support": False,
    },

    3: {
        "label": "High",
        "mode": "de_escalation",
        "response_style": "short_and_calm",
        "actions": [
            "validation",
            "grounding",
            "reduce_cognitive_load",
        ],
        "peer_support": False,
        "human_support": True,
    },

    4: {
        "label": "Crisis",
        "mode": "crisis",
        "response_style": "safety_first",
        "actions": [
            "safety_message",
            "encourage_human_support",
        ],
        "peer_support": False,
        "human_support": True,
    },
}


def get_response_policy(level: int) -> dict:
    """
    Return the response policy for a CDI level.
    """

    if level not in RESPONSE_POLICIES:
        raise ValueError("Level must be between 1 and 4.")

    return RESPONSE_POLICIES[level].copy()