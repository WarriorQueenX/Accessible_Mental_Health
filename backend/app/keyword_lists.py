"""
Per-language stress/crisis keyword lexicons.

Each language maps to three tiers, mirroring the design doc's semantic
markers for Levels 2, 3 and 4 (Level 1 is the "nothing matched" default).
Matching is done on normalized (lowercased, punctuation-stripped) transcript
text using substring/word matching -- good enough for a first pass; swap in
embedding-similarity matching later for better recall on paraphrases.

IMPORTANT: the Hindi/Hinglish lists below are seeded directly from the
examples in the design document. The Bengali, Gujarati and Tamil lists are
starter sets and MUST be reviewed by native-speaking clinicians/linguists
before this system is used on real users -- keyword coverage directly drives
crisis detection (Level 4) and under-coverage is a safety risk.
"""

# tier keys: "level2", "level3", "level4" (crisis)
KEYWORD_LEXICON = {
    "hinglish": {
        "level2": [
            "dimaag kharab", "paisa nahi", "samajh nahi aa raha",
            "thak gaya", "thak gayi", "tension", "pareshan",
            "neend nahi aa rahi", "stress ho raha", "kaam ka pressure",
        ],
        "level3": [
            "aur nahi seha jata", "koi meri baat nahi sunta",
            "sab jagah se pareshani", "bahut akela", "bahut akeli",
            "control nahi ho raha", "roz rota hoon", "roz roti hoon",
            "kuch samajh nahi aa raha kya karu",
        ],
        "level4": [
            "marna chahta hoon", "marna chahti hoon",
            "sab khatam karne ka man", "khatam kar dunga", "khatam kar dungi",
            "aakhri baar bol raha", "aakhri baar bol rahi",
            "jeena nahi chahta", "jeena nahi chahti", "suicide",
            "khud ko khatam", "zinda nahi rehna",
        ],
    },
    "hi": {
        "level2": [
            "दिमाग खराब", "पैसा नहीं बचा", "समझ नहीं आ रहा",
            "थक गया हूं", "थक गई हूं", "तनाव", "परेशान हूं", "नींद नहीं आ रही",
        ],
        "level3": [
            "अब और नहीं सहा जाता", "कोई मेरी बात नहीं सुनता",
            "सब जगह से परेशानी है", "बहुत अकेला महसूस", "काबू नहीं हो रहा",
            "रोज रोता हूं", "रोज रोती हूं",
        ],
        "level4": [
            "मरना चाहता हूं", "मरना चाहती हूं", "सब खत्म करने का मन",
            "खत्म कर दूंगा", "खत्म कर दूंगी", "आखिरी बार बोल रहा",
            "आखिरी बार बोल रही", "जीना नहीं चाहता", "जीना नहीं चाहती",
            "खुद को खत्म",
        ],
    },
    "bn": {
        "level2": [
            "মাথা খারাপ", "টাকা নেই", "বুঝতে পারছি না", "ক্লান্ত",
            "দুশ্চিন্তা", "ঘুম হচ্ছে না",
        ],
        "level3": [
            "আর সহ্য হচ্ছে না", "কেউ আমার কথা শোনে না", "খুব একা",
            "নিয়ন্ত্রণ হারিয়ে ফেলছি",
        ],
        "level4": [
            "মরে যেতে চাই", "সব শেষ করে দিতে চাই", "শেষবার বলছি",
            "বাঁচতে চাই না", "আত্মহত্যা",
        ],
    },
    "gu": {
        "level2": [
            "દિમાગ ખરાબ", "પૈસા નથી", "સમજાતું નથી", "થાકી ગયો",
            "થાકી ગઈ", "તણાવ", "ઊંઘ નથી આવતી",
        ],
        "level3": [
            "હવે સહન નથી થતું", "કોઈ મારી વાત સાંભળતું નથી", "ખૂબ એકલો",
            "કાબૂ નથી રહેતો",
        ],
        "level4": [
            "મરવું છે", "બધું ખતમ કરી દેવું છે", "છેલ્લી વાર બોલું છું",
            "જીવવું નથી", "આત્મહત્યા",
        ],
    },
    "ta": {
        "level2": [
            "மனசு சரியில்லை", "பணம் இல்லை", "புரியவில்லை", "சோர்வாக",
            "பதற்றம்", "தூக்கம் வரவில்லை",
        ],
        "level3": [
            "இனி தாங்க முடியவில்லை", "யாரும் என் பேச்சை கேட்பதில்லை",
            "மிகவும் தனிமை", "கட்டுப்பாடு இல்லை",
        ],
        "level4": [
            "இறந்து விட வேண்டும்", "எல்லாம் முடித்துவிட வேண்டும்",
            "கடைசியாக பேசுகிறேன்", "வாழ விருப்பமில்லை", "தற்கொலை",
        ],
    },
}


def get_lexicon(language: str) -> dict:
    if language not in KEYWORD_LEXICON:
        raise KeyError(
            f"No keyword lexicon for language '{language}'. "
            f"Supported: {list(KEYWORD_LEXICON.keys())}"
        )
    return KEYWORD_LEXICON[language]
