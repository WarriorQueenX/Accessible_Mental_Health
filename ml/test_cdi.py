from cdi.engine import assess_user


def run_test(name, **kwargs):
    result = assess_user(**kwargs)

    print("\n" + "=" * 45)
    print(name)
    print("=" * 45)

    print("CDI:", result["cdi"])
    print("Level:", result["level"])
    print("Label:", result["label"])
    print("Response mode:", result["response_mode"])
    print("Scores:", result["scores"])
    print("Safety:", result["safety"])


# Level 1: Low
run_test(
    "LOW STRESS",
    acoustic_score=2,
    semantic_score=2,
    history_score=2,
)


# Level 2: Moderate
run_test(
    "MODERATE STRESS",
    acoustic_score=5,
    semantic_score=6,
    history_score=5,
)


# Level 3: High
run_test(
    "HIGH DISTRESS",
    acoustic_score=8,
    semantic_score=8,
    history_score=7,
)


# Level 4: Safety override
run_test(
    "SAFETY OVERRIDE",
    acoustic_score=2,
    semantic_score=3,
    history_score=2,
    imminent_risk=True,
)