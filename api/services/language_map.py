# Map user-friendly language names to canonical language codes used by STT/TTS
LANGUAGE_MAP = {
    # A
    "Afrikaans": "af-ZA",
    "Albanian": "sq-AL",
    "Amharic": "am-ET",
    "Arabic": "ar-XA",
    "Armenian": "hy-AM",
    # B
    "Basque": "eu-ES",
    "Bengali": "bn-IN",
    "Bulgarian": "bg-BG",
    # C
    "Catalan": "ca-ES",
    "Chinese": "cmn-CN",
    "Cantonese": "yue-HK",
    "Croatian": "hr-HR",
    "Czech": "cs-CZ",
    # D
    "Danish": "da-DK",
    "Dutch": "nl-NL",
    # E
    "English": "en-US",
    "Estonian": "et-EE",
    # F
    "Filipino": "fil-PH",
    "Finnish": "fi-FI",
    "French": "fr-FR",
    # G
    "Galician": "gl-ES",
    "Georgian": "ka-GE",
    "German": "de-DE",
    "Greek": "el-GR",
    "Gujarati": "gu-IN",
    # H
    "Hebrew": "he-IL",
    "Hindi": "hi-IN",
    "Hungarian": "hu-HU",
    # I
    "Icelandic": "is-IS",
    "Indonesian": "id-ID",
    "Italian": "it-IT",
    # J
    "Japanese": "ja-JP",
    # K
    "Kannada": "kn-IN",
    "Khmer": "km-KH",
    "Korean": "ko-KR",
    # L
    "Latvian": "lv-LV",
    "Lithuanian": "lt-LT",
    # M
    "Macedonian": "mk-MK",
    "Malay": "ms-MY",
    "Malayalam": "ml-IN",
    "Marathi": "mr-IN",
    # N
    "Nepali": "ne-NP",
    "Norwegian": "nb-NO",
    # P
    "Persian": "fa-IR",
    "Polish": "pl-PL",
    "Portuguese": "pt-BR",
    "Punjabi": "pa-IN",
    # R
    "Romanian": "ro-RO",
    "Russian": "ru-RU",
    # S
    "Serbian": "sr-RS",
    "Sinhala": "si-LK",
    "Slovak": "sk-SK",
    "Slovenian": "sl-SI",
    "Spanish": "es-ES",
    "Swahili": "sw-KE",
    "Swedish": "sv-SE",
    # T
    "Tamil": "ta-IN",
    "Telugu": "te-IN",
    "Thai": "th-TH",
    "Turkish": "tr-TR",
    # U
    "Ukrainian": "uk-UA",
    "Urdu": "ur-PK",
    # V
    "Vietnamese": "vi-VN",
    # Y
    "Yoruba": "yo-NG",
    # Z
    "Zulu": "zu-ZA",
    "Hausa": "ha-NG",
    "Igbo": "ig-NG",
    "Kinyarwanda": "rw-RW",
    "Akan": "ak-GH",
    "Twi": "ak-GH",
    "Pidgin English": "pcm-NG",
    "Mandarin": "cmn-CN",
    "Cantonese": "yue-HK",
    "Arabic": "ar-SA",
    "Hindi": "hi-IN",
    "Bengali": "bn-IN",
    "Tamil": "ta-IN",
    "Telugu": "te-IN",
    "Urdu": "ur-PK",
    "Punjabi": "pa-IN"
}


def normalize_language(lang_str: str) -> str:
    """Return a canonical language code for a given user-facing language string.
    If not found, return the input unchanged (assume caller may pass a valid code).
    """
    if not lang_str:
        return "en-US"
    return LANGUAGE_MAP.get(lang_str, lang_str)
