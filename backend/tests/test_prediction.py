"""
Unit tests for EpidemicWatch AI Outbreak Prediction & Statistical Anomaly Engine.
Tests rolling Z-score calculation, risk tier stratification, and multi-horizon forecasting.
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from prediction_engine import prediction_engine


class TestOutbreakPredictionEngine(unittest.TestCase):

    def test_rolling_baseline_anomaly(self):
        # Baseline series with sudden spike at end
        series = [50, 52, 48, 51, 49, 53, 50, 52, 51, 48, 52, 50, 51, 195]
        results = prediction_engine.calculate_rolling_baseline(series, window_size=10)
        self.assertEqual(len(results), len(series))
        
        # Last element should have an elevated Z-score
        last_item = results[-1]
        self.assertGreater(last_item["z_score"], 2.5)
        self.assertTrue(last_item["is_anomaly"])

    def test_risk_score_tiers(self):
        # Low risk test
        low_risk = prediction_engine.compute_risk_score(
            current_volume=50,
            baseline_mean=55,
            z_score=0.2,
            growth_rate_pct=2.0,
            syndromic_severity=1.0
        )
        self.assertEqual(low_risk["risk_tier"], "Low")
        self.assertLess(low_risk["risk_score"], 35.0)

        # Critical risk test
        crit_risk = prediction_engine.compute_risk_score(
            current_volume=380,
            baseline_mean=80,
            z_score=3.8,
            growth_rate_pct=95.0,
            syndromic_severity=2.8
        )
        self.assertEqual(crit_risk["risk_tier"], "Critical")
        self.assertGreaterEqual(crit_risk["risk_score"], 80.0)

    def test_multi_horizon_forecasting(self):
        history = [
            {"date": f"2026-10-{i:02d}", "value": 100 + i * 5}
            for i in range(1, 15)
        ]
        forecast_14d = prediction_engine.generate_forecast(history, horizon_days=14)
        self.assertEqual(len(forecast_14d), 14)
        
        # Check confidence intervals consistency
        for pt in forecast_14d:
            self.assertLessEqual(pt["lower_95"], pt["lower_80"])
            self.assertLessEqual(pt["lower_80"], pt["projected_signals"])
            self.assertLessEqual(pt["projected_signals"], pt["upper_80"])
            self.assertLessEqual(pt["upper_80"], pt["upper_95"])


if __name__ == "__main__":
    unittest.main()
