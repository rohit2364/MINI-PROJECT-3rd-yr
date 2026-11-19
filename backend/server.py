#!/usr/bin/env python3
"""
EpidemicWatch AI - REST API Server (Python Standard Library HTTP Engine)
Runs with zero external pip dependencies on any standard Python 3.9+ installation.
Provides endpoints for surveillance metrics, NLP classification, outbreak forecasts,
interactive map nodes, and early-warning alert triage.
"""

import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime, timedelta
from typing import Dict, Any, List

from nlp_processor import nlp_classifier, SYMPTOM_TAXONOMY
from prediction_engine import prediction_engine
from epidemic_agent import epidemic_agent
import database

PORT = 8000

# In-memory mutable state initialized from database
alerts_db = [dict(a) for a in database.INITIAL_ALERTS]
posts_db = [dict(p) for p in database.INITIAL_POSTS]
regions_db = [dict(r) for r in database.REGIONS]
historical_time_series = database.generate_historical_time_series(30)


class EpidemicWatchAPIHandler(http.server.BaseHTTPRequestHandler):
    """Handles REST API requests with full CORS and JSON serialization."""

    def _set_headers(self, status: int = 200, content_type: str = "application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        """Handle CORS pre-flight requests."""
        self._set_headers(204)

    def _read_json_body(self) -> Dict[str, Any]:
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length)
        try:
            return json.loads(body.decode("utf-8"))
        except Exception:
            return {}

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        # 1. Health check
        if path == "/api/health":
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "status": "healthy",
                "system": "EpidemicWatch AI Surveillance Engine",
                "version": "1.0.0",
                "timestamp": datetime.now().isoformat(),
                "mode": "Demonstration / Synthetic Sentinel Mode"
            }).encode("utf-8"))
            return

        # 2. Main Dashboard Overview
        if path == "/api/overview":
            total_posts_analyzed = 438920
            emerging_signals = len([p for p in posts_db if p.get("is_anomaly")])
            total_signals_detected = sum(r["active_signals"] for r in regions_db)
            
            top_symptoms = [
                {"category": "Respiratory Illness", "percentage": 42.5, "count": 4820, "trend": "+18.4%"},
                {"category": "Febrile & Systemic", "percentage": 26.8, "count": 3040, "trend": "+12.1%"},
                {"category": "Gastrointestinal", "percentage": 16.4, "count": 1860, "trend": "+24.5%"},
                {"category": "Fatigue & Neurological", "percentage": 8.7, "count": 988, "trend": "-2.1%"},
                {"category": "Vector-Borne / Rash", "percentage": 5.6, "count": 635, "trend": "+32.0%"}
            ]

            payload = {
                "total_posts_analyzed": total_posts_analyzed,
                "total_signals_detected": total_signals_detected,
                "emerging_anomalous_signals": 34,
                "overall_risk_level": "High",
                "overall_risk_score": 76.4,
                "active_alerts_count": len([a for a in alerts_db if a.get("status") in ["Active", "Under Review"]]),
                "top_symptoms": top_symptoms,
                "last_data_update": datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "time_series_30d": historical_time_series,
                "diseases_tracked": database.DISEASES,
                "disclaimer": "Predictions are simulated estimates for demonstration and research, not medical diagnoses or officially confirmed outbreaks."
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(payload).encode("utf-8"))
            return

        # 3. Social Media Signals
        if path == "/api/social-signals":
            symptom_filter = query_params.get("symptom", [None])[0]
            region_filter = query_params.get("region", [None])[0]
            filtered = posts_db
            if symptom_filter:
                filtered = [p for p in filtered if p.get("symptom_category") == symptom_filter]
            if region_filter:
                filtered = [p for p in filtered if p.get("region_id") == region_filter]

            self._set_headers(200)
            self.wfile.write(json.dumps({
                "count": len(filtered),
                "signals": filtered,
                "taxonomy": SYMPTOM_TAXONOMY
            }).encode("utf-8"))
            return

        # 4. Outbreak Predictions & Forecasts
        if path == "/api/predictions":
            region_id = query_params.get("region", ["US-NY"])[0]
            horizon = int(query_params.get("horizon", [14])[0])
            
            selected_region = next((r for r in regions_db if r["id"] == region_id), regions_db[0])
            
            # Format time-series for prediction
            history_pts = [{"date": p["date"], "value": p["social_signals"]} for p in historical_time_series]
            forecast = prediction_engine.generate_forecast(history_pts, horizon_days=horizon)
            
            risk_breakdown = prediction_engine.compute_risk_score(
                current_volume=selected_region["active_signals"],
                baseline_mean=selected_region["baseline_signals"],
                z_score=selected_region["anomaly_z"],
                growth_rate_pct=round((selected_region["active_signals"] - selected_region["baseline_signals"]) / selected_region["baseline_signals"] * 100, 1),
                syndromic_severity=2.4
            )

            payload = {
                "region": selected_region,
                "horizon_days": horizon,
                "risk_analysis": risk_breakdown,
                "forecast": forecast,
                "historical": historical_time_series[-14:],
                "baseline_divergence": round(selected_region["active_signals"] / max(1, selected_region["baseline_signals"]), 2),
                "confidence_level_note": "Uncertainty cones reflect 80% and 95% forecast intervals based on empirical time-series variance."
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(payload).encode("utf-8"))
            return

        # 5. Geographic Map Regions
        if path == "/api/map/regions":
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "regions": regions_db,
                "legend": [
                    {"tier": "Low", "range": "0 - 34%", "color": "#10b981", "desc": "Discussion in line with historical baseline"},
                    {"tier": "Moderate", "range": "35 - 59%", "color": "#f59e0b", "desc": "Slight upward shift in syndromic mentions"},
                    {"tier": "High", "range": "60 - 79%", "color": "#f97316", "desc": "Statistically elevated discussion velocity (Z >= 2.0)"},
                    {"tier": "Critical", "range": "80 - 100%", "color": "#ef4444", "desc": "Severe anomaly with high multi-symptom co-occurrence"}
                ]
            }).encode("utf-8"))
            return

        # 6. Early Warning Alerts
        if path == "/api/alerts":
            status_filter = query_params.get("status", [None])[0]
            filtered_alerts = alerts_db
            if status_filter:
                filtered_alerts = [a for a in alerts_db if a.get("status") == status_filter]
            
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "total": len(alerts_db),
                "count": len(filtered_alerts),
                "alerts": filtered_alerts
            }).encode("utf-8"))
            return

        # 7. Reports & Summary Export
        if path == "/api/reports/summary":
            summary = {
                "report_id": f"REP-{datetime.now().strftime('%Y%m%d')}-01",
                "generated_at": datetime.now().isoformat(),
                "reporting_period": "Past 30 Days (Rolling)",
                "executive_summary": "Surveillance indicators show a prominent surge in respiratory illness signals centered in the Northeast US and Greater London, with secondary gastrointestinal clusters in Central Texas. Dengue activity in São Paulo remains in critical alert status.",
                "regional_rankings": sorted(regions_db, key=lambda x: x["risk_score"], reverse=True),
                "syndromic_breakdown": [
                    {"symptom": "High Fever & Chills", "mentions": 3040, "z_score": 2.84, "severity": "High"},
                    {"symptom": "Dry / Productive Cough", "mentions": 4820, "z_score": 3.42, "severity": "Critical"},
                    {"symptom": "Nausea & Vomiting", "mentions": 1860, "z_score": 2.15, "severity": "Elevated"},
                    {"symptom": "Dyspnea / Shortness of Breath", "mentions": 890, "z_score": 2.90, "severity": "Critical"},
                    {"symptom": "Retro-Orbital Pain", "mentions": 635, "z_score": 3.65, "severity": "Critical"}
                ],
                "model_parameters": {
                    "anomaly_detection": "Rolling 14-day Z-score with MAD thresholding",
                    "forecast_model": "Damped Exponential Smoothing with Poisson dispersion",
                    "disclaimer": "Simulated Research Prototype - Not intended for diagnostic or clinical triage."
                }
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(summary).encode("utf-8"))
            return

        # 8. CSV Export
        if path == "/api/reports/export.csv":
            csv_lines = [
                "RegionID,RegionName,Country,RiskTier,RiskScore,ActiveSignals,BaselineSignals,AnomalyZScore,TopSymptom,ActiveDisease,ConfirmedCases7d"
            ]
            for r in regions_db:
                csv_lines.append(
                    f'"{r["id"]}","{r["name"]}","{r["country"]}","{r["risk_tier"]}",{r["risk_score"]},{r["active_signals"]},{r["baseline_signals"]},{r["anomaly_z"]},"{r["top_symptom"]}","{r["active_disease"]}",{r["confirmed_cases_7d"]}'
                )
            csv_content = "\n".join(csv_lines)
            self.send_response(200)
            self.send_header("Content-Type", "text/csv")
            self.send_header("Content-Disposition", 'attachment; filename="epidemicwatch_surveillance_export.csv"')
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(csv_content.encode("utf-8"))
            return

        # 9. Agent Query Suggestions
        if path == "/api/agent/suggestions":
            suggestions = [
                "From which area is Dengue dominating?",
                "Which regions are currently at Critical risk?",
                "Compare the outbreak indicators between New York and California",
                "What symptoms are surging most rapidly this week?",
                "What public health interventions are recommended for São Paulo?",
                "How is the Anomaly Z-Score and outbreak risk score calculated?",
                "What is the forecast trajectory for the next 14 to 30 days?",
                "Are there any unverified early warning alerts needing triage?"
            ]
            self._set_headers(200)
            self.wfile.write(json.dumps({"suggestions": suggestions}).encode("utf-8"))
            return

        # Not Found
        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        body = self._read_json_body()

        # 1. Live NLP Analysis Endpoint
        if path == "/api/social-signals/analyze":
            text = body.get("text", "")
            if not text:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Field 'text' is required"}).encode("utf-8"))
                return

            result = nlp_classifier.classify_post(text)
            
            # If valid health post and persist requested
            if body.get("persist") and result["is_health_related"]:
                new_post = {
                    "id": f"post-{len(posts_db) + 101}",
                    "raw_text": text,
                    "anonymized_text": result["anonymized_text"],
                    "platform": body.get("platform", "User Ingested Post"),
                    "region_id": body.get("region_id", "US-NY"),
                    "timestamp": datetime.now().isoformat(),
                    "symptom_category": result["category_label"],
                    "detected_symptoms": result["detected_symptoms"],
                    "confidence": result["confidence_score"],
                    "is_health_related": True,
                    "is_anomaly": result["syndromic_weight"] >= 4.0,
                    "urgency": result["urgency_level"],
                    "verified_by_agency": False
                }
                posts_db.insert(0, new_post)

            self._set_headers(200)
            self.wfile.write(json.dumps(result).encode("utf-8"))
            return

        # 2. Update Alert Status (Acknowledge, Review, Dismiss)
        if path.startswith("/api/alerts/") and path.endswith("/status"):
            parts = path.strip("/").split("/")
            alert_id = parts[2]
            new_status = body.get("status", "Acknowledged")
            
            target_alert = next((a for a in alerts_db if a["id"] == alert_id), None)
            if not target_alert:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Alert not found"}).encode("utf-8"))
                return

            target_alert["status"] = new_status
            target_alert["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M")
            if body.get("notes"):
                target_alert["review_notes"] = body.get("notes")

            self._set_headers(200)
            self.wfile.write(json.dumps({
                "message": f"Alert {alert_id} status updated to {new_status}",
                "alert": target_alert
            }).encode("utf-8"))
            return

        # 3. Custom Forecast Request
        if path == "/api/predictions/forecast":
            historical_vals = body.get("historical_values", [p["social_signals"] for p in historical_time_series])
            horizon = int(body.get("horizon_days", 14))
            
            hist_formatted = [
                {"date": (datetime.now() - timedelta(days=len(historical_vals) - i)).strftime("%Y-%m-%d"), "value": v}
                for i, v in enumerate(historical_vals)
            ]
            forecast = prediction_engine.generate_forecast(hist_formatted, horizon_days=horizon)
            
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "horizon_days": horizon,
                "forecast": forecast
            }).encode("utf-8"))
            return

        # 4. Intelligent AI Agent Chat Endpoint
        if path == "/api/agent/chat":
            user_query = body.get("query", "")
            if not user_query:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Field 'query' is required"}).encode("utf-8"))
                return

            chat_history = body.get("history", [])
            response_payload = epidemic_agent.answer_query(user_query, chat_history)
            self._set_headers(200)
            self.wfile.write(json.dumps(response_payload).encode("utf-8"))
            return

        # Not Found
        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))


def run_server(port: int = PORT):
    handler = EpidemicWatchAPIHandler
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"============================================================")
        print(f" EpidemicWatch AI Surveillance Server running at port {port}")
        print(f" Endpoint: http://localhost:{port}/api/overview")
        print(f" Mode: Synthetic Demonstration & Research Prototype")
        print(f"============================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down EpidemicWatch AI server.")


if __name__ == "__main__":
    run_server(PORT)
