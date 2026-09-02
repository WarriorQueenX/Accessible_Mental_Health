"""
Acoustic analysis service.

Extracts pitch, pitch variance, speaking-rate proxy, energy/strain and pause
ratio from the raw waveform with librosa, then maps them onto a 1-10
"Acoustic Score" via a documented heuristic.

This heuristic is a *starting point*, not a calibrated clinical instrument:
each feature is min-max normalized against rough population ranges and
combined with the weights below. Before production use, this mapping should
be replaced/calibrated with labeled data (e.g. distress ratings from
clinicians) -- ideally by training a small regressor on top of these (or
wav2vec2-embedding) features instead of hand-set weights.

In MOCK_MODE, feature extraction still runs for real if librosa/soundfile
are available (no model weights required); only STT is mocked.
"""
import math
from dataclasses import dataclass, asdict

import numpy as np


@dataclass
class AcousticFeatures:
    mean_pitch_hz: float
    pitch_variance: float
    speaking_rate_proxy: float  # voiced-frame ratio, 0-1
    energy_variance: float      # RMS energy variance (vocal strain proxy)
    pause_ratio: float          # fraction of frames below silence threshold
    jitter: float               # avg absolute frame-to-frame pitch jump


def _normalize(value: float, low: float, high: float) -> float:
    """Clamp-and-scale `value` from [low, high] to [0, 1]."""
    if high == low:
        return 0.0
    x = (value - low) / (high - low)
    return max(0.0, min(1.0, x))


def extract_features(audio_path: str) -> AcousticFeatures:
    import librosa

    y, sr = librosa.load(audio_path, sr=16000, mono=True)
    if y.size == 0:
        raise ValueError("Empty audio file")

    # Pitch tracking (pyin is robust to noisy/short clips typical of voice
    # notes sent over WhatsApp on 2G/3G).
    f0, voiced_flag, _ = librosa.pyin(
        y, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"), sr=sr
    )
    voiced_f0 = f0[~np.isnan(f0)] if f0 is not None else np.array([])

    mean_pitch = float(np.mean(voiced_f0)) if voiced_f0.size else 0.0
    pitch_var = float(np.var(voiced_f0)) if voiced_f0.size else 0.0

    if voiced_f0.size > 1:
        jitter = float(np.mean(np.abs(np.diff(voiced_f0))))
    else:
        jitter = 0.0

    voiced_ratio = (
        float(np.mean(voiced_flag)) if voiced_flag is not None else 0.0
    )

    rms = librosa.feature.rms(y=y)[0]
    energy_var = float(np.var(rms))

    silence_thresh = 0.02
    pause_ratio = float(np.mean(rms < silence_thresh)) if rms.size else 0.0

    return AcousticFeatures(
        mean_pitch_hz=mean_pitch,
        pitch_variance=pitch_var,
        speaking_rate_proxy=voiced_ratio,
        energy_variance=energy_var,
        pause_ratio=pause_ratio,
        jitter=jitter,
    )


def score_features(features: AcousticFeatures) -> float:
    """
    Map raw AcousticFeatures onto a 1-10 Acoustic Score.

    Higher pitch variance, higher jitter, higher energy variance (strain)
    and higher pause ratio (breathlessness / broken speech) all push the
    score up, matching the Level 2-4 acoustic markers in the design doc
    ("elevated speech tempo... voice tremors" -> "high pitch variance...
    heavy breathlessness" -> "hyperventilation... flat monotone").
    """
    n_pitch_var = _normalize(features.pitch_variance, 0, 4000)
    n_jitter = _normalize(features.jitter, 0, 40)
    n_energy_var = _normalize(features.energy_variance, 0, 0.02)
    n_pause = _normalize(features.pause_ratio, 0.05, 0.6)

    # Flat/monotone detached delivery (Level 4 marker) shows up as very low
    # pitch variance despite speech being present -- catch that edge case.
    monotone_flag = 1.0 if (
        features.speaking_rate_proxy > 0.3 and n_pitch_var < 0.05
    ) else 0.0

    raw = (
        0.35 * n_pitch_var
        + 0.25 * n_jitter
        + 0.20 * n_energy_var
        + 0.20 * n_pause
    )
    raw = max(raw, 0.6 * monotone_flag)

    score = 1 + raw * 9  # scale 0-1 -> 1-10
    return round(min(10.0, max(1.0, score)), 2)


def analyze(audio_path: str) -> tuple[float, dict]:
    """Returns (acoustic_score, feature_dict) for storage/debugging."""
    features = extract_features(audio_path)
    score = score_features(features)
    return score, asdict(features)
