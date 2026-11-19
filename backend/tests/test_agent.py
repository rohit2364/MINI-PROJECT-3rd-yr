"""
Unit tests for EpidemicWatch AI - Epidemiological Intelligence Agent (Sentinel AI).
Verifies query understanding, disease dominance identification, cross-regional comparison,
and mathematical explainability output.
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from epidemic_agent import epidemic_agent


class TestEpidemiologicalAgent(unittest.TestCase):

    def test_disease_dominance_dengue(self):
        res = epidemic_agent.answer_query("From which area is dengue dominating?")
        self.assertIn("São Paulo", res["summary"])
        self.assertIn("Dengue", res["detailed_analysis"])
        self.assertGreaterEqual(len(res["key_metrics"]), 3)
        self.assertGreaterEqual(len(res["recommendations"]), 1)
        self.assertGreaterEqual(len(res["suggested_followups"]), 2)

    def test_disease_dominance_flu(self):
        res = epidemic_agent.answer_query("Where is influenza dominating right now?")
        self.assertTrue(
            "New York" in res["summary"] or "London" in res["summary"],
            f"Expected New York or London in summary, got: {res['summary']}"
        )
        self.assertIn("Influenza", res["detailed_analysis"])

    def test_critical_risk_inquiry(self):
        res = epidemic_agent.answer_query("Which regions are at Critical risk right now?")
        self.assertIn("Critical Risk", res["summary"])
        self.assertIn("New York", res["detailed_analysis"])
        self.assertIn("São Paulo", res["detailed_analysis"])

    def test_cross_regional_comparison(self):
        res = epidemic_agent.answer_query("Compare New York and California")
        self.assertIn("New York", res["summary"])
        self.assertIn("California", res["summary"])
        self.assertIn("Baseline Divergence", res["detailed_analysis"])
        self.assertEqual(len(res["key_metrics"]), 4)

    def test_mathematical_explanation(self):
        res = epidemic_agent.answer_query("How do you calculate the anomaly score and Z-score?")
        self.assertIn("Mathematical Formulation", res["summary"])
        self.assertIn("Z_t", res["detailed_analysis"])
        self.assertIn("Poisson", res["detailed_analysis"])

    def test_public_health_interventions(self):
        res = epidemic_agent.answer_query("What public health interventions are recommended?")
        self.assertIn("Protocol", res["summary"])
        self.assertIn("Level 3", res["detailed_analysis"])
        self.assertGreaterEqual(len(res["recommendations"]), 2)


if __name__ == "__main__":
    unittest.main()
