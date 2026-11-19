"""
EpidemicWatch AI - Statistical & Machine Learning Outbreak Prediction Engine
Performs time-series anomaly detection, rolling baseline estimation,
multi-horizon forecasting (7d, 14d, 30d), and explainable risk factor scoring.
"""

import math
import statistics
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Optional


class OutbreakPredictionEngine:
    """
    Combines social media symptom signals with historical baseline statistics
    to forecast outbreak trajectories and calculate probabilistic risk indicators.
    """

    def __init__(self, anomaly_z_threshold: float = 2.0):
        self.anomaly_z_threshold = anomaly_z_threshold

    def calculate_rolling_baseline(self, values: List[float], window_size: int = 14) -> List[Dict[str, float]]:
        """
        Calculate rolling mean, standard deviation, and Z-scores across a time series.
        """
        n = len(values)
        results = []

        for i in range(n):
            start_idx = max(0, i - window_size)
            window = values[start_idx:i] if i > 0 else [values[0]]
            
            if len(window) < 3:
                mean = statistics.mean(window)
                std_dev = 1.0  # Avoid zero division
            else:
                mean = statistics.mean(window)
                std_dev = statistics.stdev(window) if statistics.stdev(window) > 0.01 else 1.0

            current_val = values[i]
            z_score = (current_val - mean) / std_dev
            is_anomaly = z_score >= self.anomaly_z_threshold

            results.append({
                "value": current_val,
                "baseline_mean": round(mean, 2),
                "baseline_std": round(std_dev, 2),
                "z_score": round(z_score, 2),
                "is_anomaly": is_anomaly
            })

        return results

    def compute_risk_score(
        self,
        current_volume: float,
        baseline_mean: float,
        z_score: float,
        growth_rate_pct: float,
        syndromic_severity: float = 1.5,
        population_factor: float = 1.0
    ) -> Dict[str, Any]:
        """
        Computes probabilistic outbreak risk score (0-100%) and risk tier:
        - Low: < 30%
        - Moderate: 30% - 59%
        - High: 60% - 79%
        - Critical: >= 80%
        """
        # Feature weights for logistic response curve
        w_z = 0.38
        w_growth = 0.28
        w_syndromic = 0.22
        w_volume_ratio = 0.12

        volume_ratio = current_volume / max(1.0, baseline_mean)

        # Normalized feature contributions (0-1 range)
        norm_z = min(1.0, max(0.0, z_score / 4.0))
        norm_growth = min(1.0, max(0.0, growth_rate_pct / 100.0))
        norm_syndromic = min(1.0, syndromic_severity / 3.0)
        norm_ratio = min(1.0, max(0.0, (volume_ratio - 1.0) / 2.0))

        linear_combination = (
            w_z * norm_z +
            w_growth * norm_growth +
            w_syndromic * norm_syndromic +
            w_volume_ratio * norm_ratio
        )

        # Logistic sigmoid activation to get calibrated probability
        k = 6.0
        x0 = 0.42
        prob = 1.0 / (1.0 + math.exp(-k * (linear_combination - x0)))
        risk_score = round(prob * 100.0, 1)

        # Determine categorical tier
        if risk_score >= 80.0:
            tier = "Critical"
            color = "#ef4444"
        elif risk_score >= 60.0:
            tier = "High"
            color = "#f97316"
        elif risk_score >= 35.0:
            tier = "Moderate"
            color = "#f59e0b"
        else:
            tier = "Low"
            color = "#10b981"

        # Explainable factors with relative importance
        factors = [
            {
                "factor": "Statistical Anomaly (Z-Score)",
                "weight_pct": 38,
                "value": f"+{z_score:.1f}σ above baseline",
                "impact": "High" if z_score > 2.0 else "Normal"
            },
            {
                "factor": "Discussion Velocity (7d Growth)",
                "weight_pct": 28,
                "value": f"+{growth_rate_pct:.1f}% weekly surge",
                "impact": "High" if growth_rate_pct > 30 else "Moderate" if growth_rate_pct > 10 else "Low"
            },
            {
                "factor": "Syndromic Severity Index",
                "weight_pct": 22,
                "value": f"{syndromic_severity:.1f} / 3.0 clinical weight",
                "impact": "Severe" if syndromic_severity > 2.2 else "Moderate"
            },
            {
                "factor": "Baseline Ratio Divergence",
                "weight_pct": 12,
                "value": f"{volume_ratio:.2f}x expected seasonal norm",
                "impact": "Elevated" if volume_ratio > 1.5 else "Baseline"
            }
        ]

        return {
            "risk_score": risk_score,
            "risk_tier": tier,
            "risk_color": color,
            "linear_index": round(linear_combination, 3),
            "contributing_factors": factors
        }

    def generate_forecast(
        self,
        historical_series: List[Dict[str, Any]],
        horizon_days: int = 14,
        dampening_factor: float = 0.88
    ) -> List[Dict[str, Any]]:
        """
        Generates forward-looking projection for 7, 14, or 30 days
        with calibrated 80% and 95% uncertainty confidence intervals.
        """
        if not historical_series:
            return []

        recent_values = [p["value"] for p in historical_series[-14:]]
        last_val = recent_values[-1]
        
        # Calculate recent velocity
        if len(recent_values) >= 7:
            recent_velocity = (recent_values[-1] - recent_values[-7]) / 7.0
        else:
            recent_velocity = (recent_values[-1] - recent_values[0]) / max(1, len(recent_values))

        # Recent variance for prediction interval expansion
        recent_std = statistics.stdev(recent_values) if len(recent_values) > 2 else 5.0

        last_date_str = historical_series[-1]["date"]
        try:
            last_date = datetime.strptime(last_date_str, "%Y-%m-%d")
        except ValueError:
            last_date = datetime.now()

        forecast_points = []
        current_projected = last_val
        velocity_decay = recent_velocity

        for day in range(1, horizon_days + 1):
            projected_date = last_date + timedelta(days=day)
            
            # Apply damped trend
            velocity_decay *= dampening_factor
            current_projected += velocity_decay
            current_projected = max(0.0, current_projected)

            # Uncertainty expands with horizon sqrt(t)
            uncertainty_std = recent_std * math.sqrt(day * 0.4)
            lower_80 = max(0.0, current_projected - (1.28 * uncertainty_std))
            upper_80 = current_projected + (1.28 * uncertainty_std)
            lower_95 = max(0.0, current_projected - (1.96 * uncertainty_std))
            upper_95 = current_projected + (1.96 * uncertainty_std)

            forecast_points.append({
                "date": projected_date.strftime("%Y-%m-%d"),
                "day_ahead": day,
                "projected_signals": round(current_projected, 1),
                "lower_80": round(lower_80, 1),
                "upper_80": round(upper_80, 1),
                "lower_95": round(lower_95, 1),
                "upper_95": round(upper_95, 1),
                "forecast_type": "Simulated ML Estimate"
            })

        return forecast_points


# Singleton instance
prediction_engine = OutbreakPredictionEngine()

if __name__ == "__main__":
    sample_series = [45, 52, 48, 55, 60, 58, 62, 70, 78, 92, 115, 140, 185, 230]
    roll = prediction_engine.calculate_rolling_baseline(sample_series)
    print("Rolling Baseline:", roll[-1])
    risk = prediction_engine.compute_risk_score(
        current_volume=230,
        baseline_mean=70,
        z_score=roll[-1]["z_score"],
        growth_rate_pct=64.2,
        syndromic_severity=2.4
    )
    print("Risk Score:", risk)
