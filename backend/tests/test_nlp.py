"""
Unit tests for EpidemicWatch AI NLP Data Processing & Health Classifier.
Tests negation handling, noise filtering, anonymization, and symptom extraction.
"""

import sys
import os
import unittest

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from nlp_processor import nlp_classifier


class TestNLPEpidemicClassifier(unittest.TestCase):

    def test_anonymization(self):
        text = "Contact @dr_smith at drsmith@hospital.org or call 212-555-0198 regarding clinic hours https://health.org"
        anonymized = nlp_classifier.anonymize_text(text)
        self.assertNotIn("@dr_smith", anonymized)
        self.assertNotIn("drsmith@hospital.org", anonymized)
        self.assertNotIn("212-555-0198", anonymized)
        self.assertNotIn("https://health.org", anonymized)
        self.assertIn("[USER]", anonymized)
        self.assertIn("[EMAIL]", anonymized)
        self.assertIn("[PHONE]", anonymized)
        self.assertIn("[URL]", anonymized)

    def test_positive_health_symptom_classification(self):
        text = "Woke up with severe chills and 102 fever along with persistent dry cough."
        res = nlp_classifier.classify_post(text)
        self.assertTrue(res["is_health_related"])
        self.assertIn("dry cough", res["detected_symptoms"])
        self.assertIn("chills", res["detected_symptoms"])
        self.assertIn(res["primary_category"], ["respiratory", "febrile"])
        self.assertGreater(res["confidence_score"], 0.6)

    def test_negation_detection(self):
        text = "I tested negative for flu and had no fever, just feeling tired."
        res = nlp_classifier.classify_post(text)
        # Fever should be negated
        self.assertNotIn("fever", res["detected_symptoms"])

    def test_noise_and_figurative_filtering(self):
        figurative_texts = [
            "We danced all night long, I definitely caught the disco fever!",
            "Can you cough up the money you owe me?",
            "That was a sick skateboard trick bro!"
        ]
        for t in figurative_texts:
            res = nlp_classifier.classify_post(t)
            self.assertFalse(res["is_health_related"], f"Failed on: {t}")
            self.assertIn(res["primary_category"], ["noise", "none"])


if __name__ == "__main__":
    unittest.main()
