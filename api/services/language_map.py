# Map user-friendly language names to canonical language codes used by STT/TTS
LANGUAGE_MAP = {
    "English": "en-US",
    "French": "fr-FR",
    "Spanish": "es-ES",
    "Swahili": "sw-KE",
    "Yoruba": "yo-NG",
    "Amharic": "am-ET",
    "Zulu": "zu-ZA",
    "Hausa": "ha-NG",
    "Igbo": "ig-NG",
    "Kinyarwanda": "rw-RW",
    "Akan": "ak-GH",
    "Twi": "ak-GH",
    "Pidgin": "pcm-NG",
    # Chinese
    "Chinese": "zh-CN",
    "Mandarin": "zh-CN",
    "Cantonese": "zh-HK",
    # Arabic
    "Arabic": "ar-SA",
    # Indian languages
    "Hindi": "hi-IN",
    "Bengali": "bn-IN",
    "Tamil": "ta-IN",
    "Telugu": "te-IN",
    "Urdu": "ur-PK",
    "Punjabi": "pa-IN",
    "Gujarati": "gu-IN",
    "Marathi": "mr-IN",
    "Malayalam": "ml-IN",
    "Kannada": "kn-IN",
    # European languages
    "German": "de-DE",
    "Dutch": "nl-NL",
}


def normalize_language(lang_str: str) -> str:
    """Return a canonical language code for a given user-facing language string.
    If not found, return the input unchanged (assume caller may pass a valid code).
    """
    if not lang_str:
        return "en-US"
    return LANGUAGE_MAP.get(lang_str, lang_str)
