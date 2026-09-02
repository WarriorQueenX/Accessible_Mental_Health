"""
Speech-to-text service.

Real mode: loads a single shared `ai4bharat/indicwav2vec-v1-all` backbone
and dispatches to a language-specific classifier/CTC head selected by the
preset `language` param (never auto-detected -- per the product requirement,
the user picks their language once at session start).

Mock mode (default in this sandbox, no model download / GPU / internet):
returns a deterministic placeholder transcript so the rest of the pipeline
(acoustic + semantic + CDI + storage) is fully exercisable end-to-end.
Swap SAATHI_MOCK_MODE=0 and provide real checkpoints to go live.
"""
from functools import lru_cache

from app.config import MOCK_MODE, STT_MODEL_CHECKPOINT, SUPPORTED_LANGUAGES


class UnsupportedLanguageError(ValueError):
    pass


def _validate_language(language: str) -> None:
    if language not in SUPPORTED_LANGUAGES:
        raise UnsupportedLanguageError(
            f"'{language}' is not a preset supported language. "
            f"Choose one of: {list(SUPPORTED_LANGUAGES.keys())}"
        )


@lru_cache(maxsize=1)
def _load_real_backbone():
    """
    Lazily loads the shared indicwav2vec backbone + processor once per
    process. Only called when MOCK_MODE is False.
    """
    import torch  # noqa: F401  (imported here so mock mode never needs it)
    from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

    processor = Wav2Vec2Processor.from_pretrained(STT_MODEL_CHECKPOINT)
    model = Wav2Vec2ForCTC.from_pretrained(STT_MODEL_CHECKPOINT)
    model.eval()
    return processor, model


def _transcribe_real(audio_path: str, language: str) -> str:
    import torch
    import soundfile as sf

    processor, model = _load_real_backbone()

    speech, sample_rate = sf.read(audio_path)
    if sample_rate != 16000:
        # indicwav2vec expects 16kHz mono input.
        import librosa
        speech = librosa.resample(
            speech.astype("float32"), orig_sr=sample_rate, target_sr=16000
        )

    # `language` selects which fine-tuned head / language-adapter to route
    # through. In a real multilingual-head deployment this would select the
    # right decoder weights; wired here as a single call for clarity.
    inputs = processor(
        speech, sampling_rate=16000, return_tensors="pt", padding=True
    )
    with torch.no_grad():
        logits = model(inputs.input_values).logits
    predicted_ids = torch.argmax(logits, dim=-1)
    transcript = processor.batch_decode(predicted_ids)[0]
    return transcript.strip()


_MOCK_TRANSCRIPTS = {
    # A neutral placeholder per language so demo requests without a
    # real model still produce a plausible pipeline run.
    "hi": "आज शिफ्ट लंबा था थोड़ा थक गया हूं",
    "hinglish": "aaj shift lamba tha thoda thak gaya hoon",
    "bn": "আজ শিফট লম্বা ছিল একটু ক্লান্ত",
    "gu": "આજે શિફ્ટ લાંબી હતી થોડો થાકી ગયો",
    "ta": "இன்று ஷிப்ட் நீளமாக இருந்தது கொஞ்சம் சோர்வாக இருக்கிறேன்",
}


def transcribe(audio_path: str, language: str) -> str:
    """
    Transcribe `audio_path` assuming it is spoken in the preset `language`.

    Raises UnsupportedLanguageError if `language` isn't one of the presets.
    """
    _validate_language(language)

    if MOCK_MODE:
        return _MOCK_TRANSCRIPTS.get(language, "")

    return _transcribe_real(audio_path, language)
