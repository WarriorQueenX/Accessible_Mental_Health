"""
Semantic analysis service.

Scores a transcript against the per-language tiered keyword lexicon
(app/keyword_lists.py) and returns a 1-10 Semantic Score plus which
keywords matched and whether a hard crisis-tier hit occurred.

This is deliberately keyword-first (transparent, auditable, fast, no GPU)
rather than a black-box sentiment model -- appropriate for a safety-critical
trigger like Level 4. A transformer sentiment/embedding model can be added
alongside this as an additional signal, but should not *replace* explicit
crisis-keyword matching.
"""
import re
from dataclasses import dataclass, field

from app.keyword_lists import get_lexicon


@dataclass
class SemanticResult:
    score: float
    matched_keywords: list[str] = field(default_factory=list)
    crisis_hit: bool = False
    tier_hit: int = 1  # highest tier (1/2/3/4) triggered


def _normalize_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s\u0900-\u0DFF\u0980-\u09FF]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def _find_matches(text: str, phrases: list[str]) -> list[str]:
    return [p for p in phrases if p.lower() in text]


def analyze(transcript: str, language: str) -> SemanticResult:
    if not transcript:
        return SemanticResult(score=1.0, matched_keywords=[], crisis_hit=False, tier_hit=1)

    lexicon = get_lexicon(language)
    text = _normalize_text(transcript)

    level4_hits = _find_matches(text, lexicon["level4"])
    level3_hits = _find_matches(text, lexicon["level3"])
    level2_hits = _find_matches(text, lexicon["level2"])

    if level4_hits:
        # Direct hit on a high-risk crisis term -> hard floor in the crisis
        # band, independent of density. This feeds cdi_service's override.
        return SemanticResult(
            score=10.0,
            matched_keywords=level4_hits,
            crisis_hit=True,
            tier_hit=4,
        )

    if level3_hits:
        density_bonus = min(1.0, 0.25 * (len(level3_hits) - 1))
        score = 7.0 + density_bonus  # lands in the 7-8 High/Chronic band
        return SemanticResult(
            score=round(min(8.0, score), 2),
            matched_keywords=level3_hits,
            crisis_hit=False,
            tier_hit=3,
        )

    if level2_hits:
        density_bonus = min(2.0, 0.5 * (len(level2_hits) - 1))
        score = 4.0 + density_bonus  # lands in the 4-6 Moderate band
        return SemanticResult(
            score=round(min(6.0, score), 2),
            matched_keywords=level2_hits,
            crisis_hit=False,
            tier_hit=2,
        )

    # No stress/crisis phrase matched -> routine baseline language.
    return SemanticResult(score=2.0, matched_keywords=[], crisis_hit=False, tier_hit=1)
