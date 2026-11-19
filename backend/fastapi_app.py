"""
EpidemicWatch AI - FastAPI Implementation
Full REST API providing endpoints using FastAPI, Pydantic, and Scikit-learn integrations.
Run with: uvicorn fastapi_app:app --host 0.0.0.0 --port 8000 --reload
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from nlp_processor import nlp_classifier, SYMPTOM_TAXONOMY
from prediction_engine import prediction_engine
from epidemic_agent import epidemic_agent
import database

app = FastAPI(
    title="EpidemicWatch AI Surveillance Engine",
    description="Privacy-preserving social media syndromic surveillance and epidemic outbreak risk forecasting API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demonstration
alerts_db = [dict(a) for a in database.INITIAL_ALERTS]
posts_db = [dict(p) for p in database.INITIAL_POSTS]
regions_db = [dict(r) for r in database.REGIONS]
historical_time_series = database.generate_historical_time_series(30)


class TextAnalysisRequest(BaseModel):
    text: str
    platform: Optional[str] = "Ingested Feed"
    region_id: Optional[str] = "US-NY"
    persist: Optional[bool] = False


class AlertStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


class CustomForecastRequest(BaseModel):
    historical_values: List[float]
    horizon_days: int = 14


class AgentChatRequest(BaseModel):
    query: str
    history: Optional[List[Dict[str, str]]] = None


@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "framework": "FastAPI",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/overview")
def get_overview():
    return {
        "total_posts_analyzed": 438920,
        "total_signals_detected": sum(r["active_signals"] for r in regions_db),
        "emerging_anomalous_signals": len([p for p in posts_db if p.get("is_anomaly")]),
        "overall_risk_level": "High",
        "overall_risk_score": 76.4,
        "active_alerts_count": len([a for a in alerts_db if a.get("status") in ["Active", "Under Review"]]),
        "top_symptoms": [
            {"category": "Respiratory Illness", "percentage": 42.5, "count": 4820, "trend": "+18.4%"},
            {"category": "Febrile & Systemic", "percentage": 26.8, "count": 3040, "trend": "+12.1%"},
            {"category": "Gastrointestinal", "percentage": 16.4, "count": 1860, "trend": "+24.5%"},
            {"category": "Fatigue & Neurological", "percentage": 8.7, "count": 988, "trend": "-2.1%"},
            {"category": "Vector-Borne / Rash", "percentage": 5.6, "count": 635, "trend": "+32.0%"}
        ],
        "last_data_update": datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "time_series_30d": historical_time_series,
        "diseases_tracked": database.DISEASES,
        "disclaimer": "Predictions are simulated estimates for demonstration and research, not medical diagnoses or officially confirmed outbreaks."
    }


@app.get("/api/social-signals")
def get_social_signals(symptom: Optional[str] = None, region: Optional[str] = None):
    filtered = posts_db
    if symptom:
        filtered = [p for p in filtered if p.get("symptom_category") == symptom]
    if region:
        filtered = [p for p in filtered if p.get("region_id") == region]
    return {
        "count": len(filtered),
        "signals": filtered,
        "taxonomy": SYMPTOM_TAXONOMY
    }


@app.post("/api/social-signals/analyze")
def analyze_social_post(req: TextAnalysisRequest):
    result = nlp_classifier.classify_post(req.text)
    if req.persist and result["is_health_related"]:
        new_post = {
            "id": f"post-{len(posts_db) + 101}",
            "raw_text": req.text,
            "anonymized_text": result["anonymized_text"],
            "platform": req.platform,
            "region_id": req.region_id,
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
    return result


@app.get("/api/predictions")
def get_predictions(region: str = "US-NY", horizon: int = 14):
    selected = next((r for r in regions_db if r["id"] == region), regions_db[0])
    history_pts = [{"date": p["date"], "value": p["social_signals"]} for p in historical_time_series]
    forecast = prediction_engine.generate_forecast(history_pts, horizon_days=horizon)
    risk_breakdown = prediction_engine.compute_risk_score(
        current_volume=selected["active_signals"],
        baseline_mean=selected["baseline_signals"],
        z_score=selected["anomaly_z"],
        growth_rate_pct=round((selected["active_signals"] - selected["baseline_signals"]) / selected["baseline_signals"] * 100, 1),
        syndromic_severity=2.4
    )
    return {
        "region": selected,
        "horizon_days": horizon,
        "risk_analysis": risk_breakdown,
        "forecast": forecast,
        "historical": historical_time_series[-14:],
        "baseline_divergence": round(selected["active_signals"] / max(1, selected["baseline_signals"]), 2)
    }


@app.get("/api/map/regions")
def get_map_regions():
    return {
        "regions": regions_db,
        "legend": [
            {"tier": "Low", "range": "0 - 34%", "color": "#10b981", "desc": "Discussion in line with historical baseline"},
            {"tier": "Moderate", "range": "35 - 59%", "color": "#f59e0b", "desc": "Slight upward shift in syndromic mentions"},
            {"tier": "High", "range": "60 - 79%", "color": "#f97316", "desc": "Statistically elevated discussion velocity (Z >= 2.0)"},
            {"tier": "Critical", "range": "80 - 100%", "color": "#ef4444", "desc": "Severe anomaly with high multi-symptom co-occurrence"}
        ]
    }


@app.get("/api/alerts")
def get_alerts(status: Optional[str] = None):
    filtered = alerts_db
    if status:
        filtered = [a for a in alerts_db if a.get("status") == status]
    return {
        "total": len(alerts_db),
        "count": len(filtered),
        "alerts": filtered
    }


@app.post("/api/alerts/{alert_id}/status")
def update_alert_status(alert_id: str, req: AlertStatusUpdate):
    target = next((a for a in alerts_db if a["id"] == alert_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Alert not found")
    target["status"] = req.status
    target["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M")
    if req.notes:
        target["review_notes"] = req.notes
    return {"message": "Status updated", "alert": target}


@app.get("/api/reports/summary")
def get_reports_summary():
    return {
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
        ]
    }


@app.get("/api/reports/export.csv")
def export_csv():
    csv_lines = [
        "RegionID,RegionName,Country,RiskTier,RiskScore,ActiveSignals,BaselineSignals,AnomalyZScore,TopSymptom,ActiveDisease,ConfirmedCases7d"
    ]
    for r in regions_db:
        csv_lines.append(
            f'"{r["id"]}","{r["name"]}","{r["country"]}","{r["risk_tier"]}",{r["risk_score"]},{r["active_signals"]},{r["baseline_signals"]},{r["anomaly_z"]},"{r["top_symptom"]}","{r["active_disease"]}",{r["confirmed_cases_7d"]}'
        )
    return PlainTextResponse("\n".join(csv_lines), media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="epidemicwatch_surveillance_export.csv"'})


@app.get("/api/agent/suggestions")
def get_agent_suggestions():
    return {
        "suggestions": [
            "From which area is Dengue dominating?",
            "Which regions are currently at Critical risk?",
            "Compare the outbreak indicators between New York and California",
            "What symptoms are surging most rapidly this week?",
            "What public health interventions are recommended for São Paulo?",
            "How is the Anomaly Z-Score and outbreak risk score calculated?",
            "What is the forecast trajectory for the next 14 to 30 days?",
            "Are there any unverified early warning alerts needing triage?"
        ]
    }


@app.post("/api/agent/chat")
def chat_with_agent(req: AgentChatRequest):
    if not req.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    return epidemic_agent.answer_query(req.query, req.history)
