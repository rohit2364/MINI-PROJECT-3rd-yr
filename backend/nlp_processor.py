"""
EpidemicWatch AI - NLP Data Processing & Health Signal Classifier
Processes unstructured social media text, applies privacy-preserving anonymization,
filters noise/spam, handles negations, and categorizes health signals.
"""

import re
import math
from typing import Dict, List, Any, Optional

# Symptom Taxonomy with keywords, synonyms, and clinical severity weight (1-3)
SYMPTOM_TAXONOMY = {
    "respiratory": {
        "label": "Respiratory Illness",
        "keywords": [
            "cough", "coughing", "dry cough", "productive cough", "sore throat", "wheezing",
            "shortness of breath", "dyspnea", "chest tightness", "chest congestion", "runny nose",
            "nasal congestion", "sneezing", "bronchitis", "respiratory", "difficulty breathing"
        ],
        "weight": 2.2
    },
    "febrile": {
        "label": "Febrile & Systemic",
        "keywords": [
            "fever", "high fever", "low grade fever", "chills", "shivering", "night sweats",
            "body ache", "muscle ache", "myalgia", "rigors", "temperature 102", "temperature 103",
            "burning up", "sweating bullets"
        ],
        "weight": 2.5
    },
    "gastrointestinal": {
        "label": "Gastrointestinal",
        "keywords": [
            "nausea", "vomiting", "vomit", "threw up", "throwing up", "diarrhea", "stomach bug",
            "stomach flu", "abdominal cramp", "stomach pain", "food poisoning", "gastroenteritis",
            "loose stool", "dehydration"
        ],
        "weight": 2.0
    },
    "fatigue_neurological": {
        "label": "Fatigue & Neurological",
        "keywords": [
            "extreme fatigue", "exhaustion", "brain fog", "loss of taste", "loss of smell",
            "ageusia", "anosmia", "splitting headache", "migraine", "dizziness", "vertigo",
            "cannot get out of bed", "prostration"
        ],
        "weight": 1.8
    },
    "vector_borne": {
        "label": "Vector-Borne / Rash",
        "keywords": [
            "joint pain", "arthralgia", "petechiae", "skin rash", "retro-orbital pain",
            "eye pain", "mosquito bite", "dengue", "platelet drop", "high fever with rash"
        ],
        "weight": 2.6
    }
}

# Negation terms that indicate absence of symptom
NEGATION_TERMS = [
    "no", "not", "without", "negative for", "tested negative", "denies", "didn't have",
    "did not have", "free of", "never had", "cleared of", "false alarm"
]

# Non-health or figurative noise terms to discard
NOISE_PATTERNS = [
    r"\bcabinc? fever\b",
    r"\bspring fever\b",
    r"\bdisco fever\b",
    r"\bfever pitch\b",
    r"\bbieber fever\b",
    r"\bgold fever\b",
    r"\bcough(ing)? up (the |some )?(cash|money|funds)\b",
    r"\bsick kickflip\b",
    r"\bsick car\b",
    r"\bsick beat\b",
    r"\bsick (trick|riff|tune|drop|move)\b",
    r"\bviral video\b",
    r"\bwent viral\b"
]

# Privacy Anonymization Regexes
URL_PATTERN = re.compile(r'https?://\S+|www\.\S+', re.IGNORECASE)
EMAIL_PATTERN = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
HANDLE_PATTERN = re.compile(r'@\w+')
PHONE_PATTERN = re.compile(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b')


class NLPEpidemicClassifier:
    """
    Rule-based and semantic statistical NLP classifier optimized for public health syndromic surveillance.
    Operates without heavy binary dependencies to ensure 100% portability.
    """

    def __init__(self):
        self.noise_regexes = [re.compile(p, re.IGNORECASE) for p in NOISE_PATTERNS]

    def anonymize_text(self, text: str) -> str:
        """Strip PII including user handles, URLs, email addresses, and phone numbers."""
        text = URL_PATTERN.sub("[URL]", text)
        text = EMAIL_PATTERN.sub("[EMAIL]", text)
        text = HANDLE_PATTERN.sub("[USER]", text)
        text = PHONE_PATTERN.sub("[PHONE]", text)
        return text.strip()

    def is_spam_or_figurative(self, text: str) -> bool:
        """Detect idioms, figurative expressions, or spam using pattern matching."""
        lower = text.lower()
        for regex in self.noise_regexes:
            if regex.search(lower):
                return True
        # Check spam indicators
        if any(w in lower for w in ["buy now", "discount", "promo code", "crypto", "casino", "free gift"]):
            return True
        return False

    def check_negation(self, text: str, keyword: str) -> bool:
        """Check if a symptom keyword is preceded by negation within a 4-word window."""
        lower = text.lower()
        kw_pos = lower.find(keyword)
        if kw_pos == -1:
            return False

        # Look at window preceding keyword
        preceding = lower[max(0, kw_pos - 35):kw_pos]
        words = preceding.split()
        for neg in NEGATION_TERMS:
            if neg in preceding:
                # Ensure negation is close to the keyword
                for w in words[-4:]:
                    if w == neg or neg in w:
                        return True
        return False

    def classify_post(self, text: str) -> Dict[str, Any]:
        """
        Process and classify an individual social post.
        Returns:
            - is_health_related: bool
            - anonymized_text: str
            - primary_category: str (or None)
            - detected_symptoms: List[str]
            - confidence_score: float (0.0 to 1.0)
            - urgency_level: str ("Low", "Medium", "High", "Critical")
            - syndromic_weight: float
        """
        clean_text = self.anonymize_text(text)

        if self.is_spam_or_figurative(clean_text):
            return {
                "is_health_related": False,
                "anonymized_text": clean_text,
                "primary_category": "noise",
                "detected_symptoms": [],
                "confidence_score": 0.05,
                "urgency_level": "Low",
                "syndromic_weight": 0.0,
                "rejection_reason": "Figurative speech or promotional spam"
            }

        detected_by_cat: Dict[str, List[str]] = {}
        category_scores: Dict[str, float] = {}

        for cat_key, cat_data in SYMPTOM_TAXONOMY.items():
            detected_in_cat = []
            for kw in cat_data["keywords"]:
                pattern = r'\b' + re.escape(kw) + r'\b'
                if re.search(pattern, clean_text, re.IGNORECASE):
                    # Check for negation
                    if not self.check_negation(clean_text, kw):
                        detected_in_cat.append(kw)

            if detected_in_cat:
                detected_by_cat[cat_key] = detected_in_cat
                # Score combines match count and taxonomy weight
                category_scores[cat_key] = len(detected_in_cat) * cat_data["weight"]

        if not category_scores:
            return {
                "is_health_related": False,
                "anonymized_text": clean_text,
                "primary_category": "none",
                "detected_symptoms": [],
                "confidence_score": 0.12,
                "urgency_level": "Low",
                "syndromic_weight": 0.0,
                "rejection_reason": "No relevant clinical symptom keywords identified"
            }

        # Determine primary category with highest weighted score
        primary_cat = max(category_scores, key=category_scores.get)
        all_symptoms = [s for sublist in detected_by_cat.values() for s in sublist]
        total_score = sum(category_scores.values())

        # Confidence calculation based on symptom density & co-occurrence
        confidence = min(0.98, round(0.45 + (0.12 * len(all_symptoms)) + (0.05 * len(category_scores)), 2))

        # Urgency estimation
        urgency = "Low"
        if "difficulty breathing" in all_symptoms or "shortness of breath" in all_symptoms or "temperature 103" in all_symptoms:
            urgency = "Critical"
        elif total_score >= 5.0 or ("fever" in all_symptoms and "cough" in all_symptoms):
            urgency = "High"
        elif total_score >= 2.5:
            urgency = "Medium"

        return {
            "is_health_related": True,
            "anonymized_text": clean_text,
            "primary_category": primary_cat,
            "category_label": SYMPTOM_TAXONOMY[primary_cat]["label"],
            "detected_symptoms": all_symptoms,
            "confidence_score": confidence,
            "urgency_level": urgency,
            "syndromic_weight": round(total_score, 2),
            "rejection_reason": None
        }


# Singleton instance
nlp_classifier = NLPEpidemicClassifier()

if __name__ == "__main__":
    sample_posts = [
        "Woke up with severe chills and 102 fever. My whole family has this terrible dry cough in Queens.",
        "Tested negative for flu but I still have a mild sore throat.",
        "Had a blast at the concert last night, the music gave me disco fever!",
        "Stomach bug is tearing through our school. 4 kids vomiting and high fever since yesterday.",
        "Can anyone recommend a good doctor? Shortness of breath and chest tightness since Tuesday @hospital"
    ]
    for p in sample_posts:
        res = nlp_classifier.classify_post(p)
        print(f"Input: {p}")
        print(f"Result: {res}\n")
