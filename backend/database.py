"""
EpidemicWatch AI - Database & Realistic Synthetic Health Surveillance Dataset
Provides structured records for regions, diseases, historical baselines,
social media signals, alerts, and model validation data.
"""

from datetime import datetime, timedelta
import random

# Geographic surveillance nodes with coordinates and baseline populations
REGIONS = [
    {
        "id": "US-NY",
        "name": "New York, USA",
        "country": "United States",
        "state": "New York",
        "coordinates": [40.7128, -74.0060],
        "population": 19571216,
        "primary_sentinel": "Metro Region Health Bureau",
        "risk_tier": "Critical",
        "risk_score": 88.4,
        "active_signals": 1420,
        "baseline_signals": 420,
        "anomaly_z": 3.42,
        "top_symptom": "Respiratory Illness",
        "active_disease": "Influenza-Like Illness (ILI)",
        "confirmed_cases_7d": 4120,
        "signal_to_case_ratio": 0.34
    },
    {
        "id": "US-CA",
        "name": "California, USA",
        "country": "United States",
        "state": "California",
        "coordinates": [36.7783, -119.4179],
        "population": 39029342,
        "primary_sentinel": "Pacific Public Health Network",
        "risk_tier": "High",
        "risk_score": 74.2,
        "active_signals": 2180,
        "baseline_signals": 910,
        "anomaly_z": 2.78,
        "top_symptom": "Febrile & Systemic",
        "active_disease": "COVID-19 JN.1 Subvariant",
        "confirmed_cases_7d": 6250,
        "signal_to_case_ratio": 0.35
    },
    {
        "id": "US-TX",
        "name": "Texas, USA",
        "country": "United States",
        "state": "Texas",
        "coordinates": [31.9686, -99.9018],
        "population": 30029572,
        "primary_sentinel": "Southern Health Surveillance Hub",
        "risk_tier": "High",
        "risk_score": 68.5,
        "active_signals": 1640,
        "baseline_signals": 780,
        "anomaly_z": 2.31,
        "top_symptom": "Gastrointestinal",
        "active_disease": "Norovirus / Acute GI",
        "confirmed_cases_7d": 3810,
        "signal_to_case_ratio": 0.43
    },
    {
        "id": "US-FL",
        "name": "Florida, USA",
        "country": "United States",
        "state": "Florida",
        "coordinates": [27.6648, -81.5158],
        "population": 22244823,
        "primary_sentinel": "Subtropical Disease Center",
        "risk_tier": "Moderate",
        "risk_score": 52.8,
        "active_signals": 920,
        "baseline_signals": 640,
        "anomaly_z": 1.45,
        "top_symptom": "Vector-Borne / Rash",
        "active_disease": "Dengue Fever (Serotype 2)",
        "confirmed_cases_7d": 1840,
        "signal_to_case_ratio": 0.50
    },
    {
        "id": "US-WA",
        "name": "Washington, USA",
        "country": "United States",
        "state": "Washington",
        "coordinates": [47.7511, -120.7401],
        "population": 7785786,
        "primary_sentinel": "Northwest Health Observatory",
        "risk_tier": "Moderate",
        "risk_score": 46.1,
        "active_signals": 480,
        "baseline_signals": 390,
        "anomaly_z": 1.12,
        "top_symptom": "Respiratory Illness",
        "active_disease": "RSV (Respiratory Syncytial Virus)",
        "confirmed_cases_7d": 980,
        "signal_to_case_ratio": 0.49
    },
    {
        "id": "US-IL",
        "name": "Illinois, USA",
        "country": "United States",
        "state": "Illinois",
        "coordinates": [40.6331, -89.3985],
        "population": 12582032,
        "primary_sentinel": "Great Lakes Epidemiological Lab",
        "risk_tier": "Low",
        "risk_score": 24.3,
        "active_signals": 310,
        "baseline_signals": 350,
        "anomaly_z": -0.32,
        "top_symptom": "Fatigue & Neurological",
        "active_disease": "Seasonal Baseline",
        "confirmed_cases_7d": 620,
        "signal_to_case_ratio": 0.50
    },
    {
        "id": "UK-LON",
        "name": "London, UK",
        "country": "United Kingdom",
        "state": "Greater London",
        "coordinates": [51.5074, -0.1278],
        "population": 8982000,
        "primary_sentinel": "UK Health Security Agency Sentinel",
        "risk_tier": "High",
        "risk_score": 71.8,
        "active_signals": 1120,
        "baseline_signals": 520,
        "anomaly_z": 2.54,
        "top_symptom": "Respiratory Illness",
        "active_disease": "Influenza-Like Illness (ILI)",
        "confirmed_cases_7d": 2900,
        "signal_to_case_ratio": 0.39
    },
    {
        "id": "JP-TYO",
        "name": "Tokyo, Japan",
        "country": "Japan",
        "state": "Tokyo Prefecture",
        "coordinates": [35.6762, 139.6503],
        "population": 14094034,
        "primary_sentinel": "Tokyo Infectious Disease Center",
        "risk_tier": "Moderate",
        "risk_score": 42.0,
        "active_signals": 840,
        "baseline_signals": 710,
        "anomaly_z": 0.95,
        "top_symptom": "Respiratory Illness",
        "active_disease": "Seasonal Rhinovirus",
        "confirmed_cases_7d": 1450,
        "signal_to_case_ratio": 0.58
    },
    {
        "id": "BR-SP",
        "name": "São Paulo, Brazil",
        "country": "Brazil",
        "state": "São Paulo",
        "coordinates": [-23.5505, -46.6333],
        "population": 12396372,
        "primary_sentinel": "Paulista Epidemiological Watch",
        "risk_tier": "Critical",
        "risk_score": 86.2,
        "active_signals": 2340,
        "baseline_signals": 720,
        "anomaly_z": 3.65,
        "top_symptom": "Vector-Borne / Rash",
        "active_disease": "Dengue Outbreak (DENV-1/2)",
        "confirmed_cases_7d": 8400,
        "signal_to_case_ratio": 0.28
    },
    {
        "id": "IN-MUM",
        "name": "Mumbai, India",
        "country": "India",
        "state": "Maharashtra",
        "coordinates": [19.0760, 72.8777],
        "population": 12478447,
        "primary_sentinel": "Western Urban Public Health Surveillance",
        "risk_tier": "High",
        "risk_score": 78.4,
        "active_signals": 1890,
        "baseline_signals": 740,
        "anomaly_z": 2.89,
        "top_symptom": "Febrile & Systemic",
        "active_disease": "Acute Viral Pyrexia / Flu",
        "confirmed_cases_7d": 5200,
        "signal_to_case_ratio": 0.36
    }
]

# Disease taxonomy with clinical indicators and reproduction rate estimates
DISEASES = [
    {
        "code": "ILI",
        "name": "Influenza-Like Illness",
        "category": "Respiratory",
        "typical_r0": "1.3 - 1.8",
        "incubation_days": "1 - 4 days",
        "primary_symptoms": ["High fever", "Dry cough", "Body ache", "Extreme fatigue"],
        "cdc_who_code": "ICD-10 J10.1"
    },
    {
        "code": "COVID_JN1",
        "name": "COVID-19 (JN.1 / FLiRT Variants)",
        "category": "Respiratory / Systemic",
        "typical_r0": "2.5 - 3.8",
        "incubation_days": "2 - 5 days",
        "primary_symptoms": ["Sore throat", "Fever", "Congestion", "Fatigue", "Loss of smell"],
        "cdc_who_code": "ICD-10 U07.1"
    },
    {
        "code": "RSV",
        "name": "Respiratory Syncytial Virus",
        "category": "Respiratory (Pediatric/Elderly Focus)",
        "typical_r0": "1.2 - 2.0",
        "incubation_days": "4 - 6 days",
        "primary_symptoms": ["Wheezing", "Severe cough", "Runny nose", "Decreased appetite"],
        "cdc_who_code": "ICD-10 J21.0"
    },
    {
        "code": "NORO",
        "name": "Norovirus / Acute Gastroenteritis",
        "category": "Gastrointestinal",
        "typical_r0": "2.0 - 3.5",
        "incubation_days": "12 - 48 hours",
        "primary_symptoms": ["Vomiting", "Watery diarrhea", "Abdominal cramps", "Nausea"],
        "cdc_who_code": "ICD-10 A08.1"
    },
    {
        "code": "DENGUE",
        "name": "Dengue Fever (Vector-Borne)",
        "category": "Vector-Borne / Hemorrhagic",
        "typical_r0": "1.5 - 2.5",
        "incubation_days": "4 - 10 days",
        "primary_symptoms": ["Retro-orbital pain", "High fever", "Severe joint pain", "Skin rash"],
        "cdc_who_code": "ICD-10 A90"
    }
]

# Pre-seeded social media posts (privacy-sanitized, labeled as synthetic)
INITIAL_POSTS = [
    {
        "id": "post-101",
        "raw_text": "Half of my floor at work in Manhattan called in sick with 103 fever and this agonizing dry cough. ER wait times are insane.",
        "anonymized_text": "Half of my floor at work in Manhattan called in sick with 103 fever and this agonizing dry cough. ER wait times are insane.",
        "platform": "Reddit (r/nyc)",
        "region_id": "US-NY",
        "timestamp": (datetime.now() - timedelta(minutes=14)).isoformat(),
        "symptom_category": "Respiratory Illness",
        "detected_symptoms": ["103 fever", "dry cough"],
        "confidence": 0.94,
        "is_health_related": True,
        "is_anomaly": True,
        "urgency": "Critical",
        "verified_by_agency": False
    },
    {
        "id": "post-102",
        "raw_text": "Daughter's preschool in Brooklyn sent an urgent memo: 8 kids down with severe vomiting and diarrhea within 24 hours. Norovirus again?",
        "anonymized_text": "Daughter's preschool in Brooklyn sent an urgent memo: 8 kids down with severe vomiting and diarrhea within 24 hours. Norovirus again?",
        "platform": "Parenting Health Forum",
        "region_id": "US-NY",
        "timestamp": (datetime.now() - timedelta(minutes=38)).isoformat(),
        "symptom_category": "Gastrointestinal",
        "detected_symptoms": ["vomiting", "diarrhea"],
        "confidence": 0.91,
        "is_health_related": True,
        "is_anomaly": True,
        "urgency": "High",
        "verified_by_agency": False
    },
    {
        "id": "post-103",
        "raw_text": "Splitting headache, high fever, and horrible eye pain behind my sockets after visiting the beach in Santos. Doctor ordered platelet check.",
        "anonymized_text": "Splitting headache, high fever, and horrible eye pain behind my sockets after visiting the beach in Santos. Doctor ordered platelet check.",
        "platform": "Bluesky (Health Tag)",
        "region_id": "BR-SP",
        "timestamp": (datetime.now() - timedelta(hours=1, minutes=12)).isoformat(),
        "symptom_category": "Vector-Borne / Rash",
        "detected_symptoms": ["headache", "high fever", "eye pain"],
        "confidence": 0.96,
        "is_health_related": True,
        "is_anomaly": True,
        "urgency": "Critical",
        "verified_by_agency": True
    },
    {
        "id": "post-104",
        "raw_text": "Anyone else in Los Angeles dealing with endless wheezing and shortness of breath? Tested negative for COVID twice.",
        "anonymized_text": "Anyone else in Los Angeles dealing with endless wheezing and shortness of breath? Tested negative for COVID twice.",
        "platform": "Reddit (r/LosAngeles)",
        "region_id": "US-CA",
        "timestamp": (datetime.now() - timedelta(hours=2, minutes=5)).isoformat(),
        "symptom_category": "Respiratory Illness",
        "detected_symptoms": ["wheezing", "shortness of breath"],
        "confidence": 0.89,
        "is_health_related": True,
        "is_anomaly": False,
        "urgency": "High",
        "verified_by_agency": False
    },
    {
        "id": "post-105",
        "raw_text": "Spring fever is hitting hard! Can't wait to play tennis this weekend. Check out my new racket @promo",
        "anonymized_text": "Spring fever is hitting hard! Can't wait to play tennis this weekend. Check out my new racket [USER]",
        "platform": "Reddit (r/sports)",
        "region_id": "US-CA",
        "timestamp": (datetime.now() - timedelta(hours=2, minutes=30)).isoformat(),
        "symptom_category": "noise",
        "detected_symptoms": [],
        "confidence": 0.05,
        "is_health_related": False,
        "is_anomaly": False,
        "urgency": "Low",
        "verified_by_agency": False
    },
    {
        "id": "post-106",
        "raw_text": "High fever, chills, and myalgia running through our entire student dormitory in London. Pharmacy ran out of paracetamol.",
        "anonymized_text": "High fever, chills, and myalgia running through our entire student dormitory in London. Pharmacy ran out of paracetamol.",
        "platform": "Public University Forum",
        "region_id": "UK-LON",
        "timestamp": (datetime.now() - timedelta(hours=3, minutes=18)).isoformat(),
        "symptom_category": "Febrile & Systemic",
        "detected_symptoms": ["high fever", "chills", "myalgia"],
        "confidence": 0.95,
        "is_health_related": True,
        "is_anomaly": True,
        "urgency": "High",
        "verified_by_agency": False
    },
    {
        "id": "post-107",
        "raw_text": "Whole office in Austin has sudden stomach cramps, nausea, and vomiting after the catering event yesterday.",
        "anonymized_text": "Whole office in Austin has sudden stomach cramps, nausea, and vomiting after the catering event yesterday.",
        "platform": "Reddit (r/Austin)",
        "region_id": "US-TX",
        "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(),
        "symptom_category": "Gastrointestinal",
        "detected_symptoms": ["stomach cramps", "nausea", "vomiting"],
        "confidence": 0.92,
        "is_health_related": True,
        "is_anomaly": True,
        "urgency": "High",
        "verified_by_agency": False
    },
    {
        "id": "post-108",
        "raw_text": "Severe dengue spike reported across suburbs of São Paulo with 8,400 confirmed serology tests this week. Health department deploying fumigation vans.",
        "anonymized_text": "Severe dengue spike reported across suburbs of São Paulo with 8,400 confirmed serology tests this week. Health department deploying fumigation vans.",
        "platform": "Public Health Official Feed",
        "region_id": "BR-SP",
        "timestamp": (datetime.now() - timedelta(hours=4, minutes=45)).isoformat(),
        "symptom_category": "Vector-Borne / Rash",
        "detected_symptoms": ["dengue"],
        "confidence": 0.98,
        "is_health_related": True,
        "is_anomaly": True,
        "urgency": "Critical",
        "verified_by_agency": True
    }
]

# Initial Early Warning Alerts
INITIAL_ALERTS = [
    {
        "id": "ALT-2026-001",
        "region_id": "US-NY",
        "region_name": "New York, USA",
        "disease": "Influenza-Like Illness (ILI)",
        "symptom_cluster": "High Fever (102°F+), Dry Cough, Dyspnea",
        "risk_tier": "Critical",
        "risk_score": 88.4,
        "anomaly_z_score": 3.42,
        "detected_velocity": "+74.2% weekly volume spike",
        "status": "Active",
        "verification_status": "Unverified Public Health Signal",
        "first_detected": (datetime.now() - timedelta(days=2, hours=4)).strftime("%Y-%m-%d %H:%M"),
        "last_updated": (datetime.now() - timedelta(minutes=24)).strftime("%Y-%m-%d %H:%M"),
        "trigger_explanation": "Statistically extreme keyword surge (Z=3.42σ). Discussion volume is 3.38x above the 30-day baseline, with 68% co-occurrence of high fever and acute respiratory symptoms across Queens and Brooklyn.",
        "recommended_protocol": [
            "Initiate syndromic surveillance query with regional hospital EHR networks.",
            "Cross-reference ILINet sentinel laboratory sample positivity rates.",
            "Issue non-alarmist public guidance on seasonal respiratory hygiene and vaccination."
        ]
    },
    {
        "id": "ALT-2026-002",
        "region_id": "BR-SP",
        "region_name": "São Paulo, Brazil",
        "disease": "Dengue Fever (DENV-1/2)",
        "symptom_cluster": "Severe Retro-Orbital Pain, High Fever, Thrombocytopenia mentions",
        "risk_tier": "Critical",
        "risk_score": 86.2,
        "anomaly_z_score": 3.65,
        "detected_velocity": "+112.5% weekly volume spike",
        "status": "Under Review",
        "verification_status": "Corroborated by Municipal Surveillance",
        "first_detected": (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d %H:%M"),
        "last_updated": (datetime.now() - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M"),
        "trigger_explanation": "Substantial clustering of vector-borne symptom complaints corroborated by 8,400 municipal clinic serology reports. Ambient temperature and precipitation indices elevate mosquito vector breeding risk.",
        "recommended_protocol": [
            "Coordinate vector abatement spray trucks in prioritized municipal zones.",
            "Distribute mosquito repellent and larvicide tablets in vulnerable districts.",
            "Ensure emergency triage hydration stations are staffed."
        ]
    },
    {
        "id": "ALT-2026-003",
        "region_id": "US-CA",
        "region_name": "California, USA",
        "disease": "COVID-19 JN.1 Subvariant",
        "symptom_cluster": "Sore Throat, Low-grade Fever, Extreme Exhaustion",
        "risk_tier": "High",
        "risk_score": 74.2,
        "anomaly_z_score": 2.78,
        "detected_velocity": "+48.6% weekly volume spike",
        "status": "Active",
        "verification_status": "Unverified Public Health Signal",
        "first_detected": (datetime.now() - timedelta(days=1, hours=8)).strftime("%Y-%m-%d %H:%M"),
        "last_updated": (datetime.now() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"),
        "trigger_explanation": "Elevated discussion density observed in San Francisco Bay Area and Greater Los Angeles subreddits. Anomaly threshold exceeded for 3 consecutive days.",
        "recommended_protocol": [
            "Analyze regional wastewater concentration data for SARS-CoV-2 viral copies.",
            "Review workplace absentee reports from public school districts.",
            "Advise at-risk individuals to consider rapid antigen testing if symptomatic."
        ]
    },
    {
        "id": "ALT-2026-004",
        "region_id": "US-TX",
        "region_name": "Texas, USA",
        "disease": "Norovirus / Acute GI",
        "symptom_cluster": "Acute Vomiting, Dehydration, Abdominal Cramping",
        "risk_tier": "High",
        "risk_score": 68.5,
        "anomaly_z_score": 2.31,
        "detected_velocity": "+52.0% weekly volume spike",
        "status": "Active",
        "verification_status": "Unverified Public Health Signal",
        "first_detected": (datetime.now() - timedelta(hours=18)).strftime("%Y-%m-%d %H:%M"),
        "last_updated": (datetime.now() - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M"),
        "trigger_explanation": "Localized spikes in school and catering-related gastrointestinal complaints across Austin and Houston metropolitan areas.",
        "recommended_protocol": [
            "Check local food safety and commercial dining inspection reports.",
            "Issue sanitation protocol reminders to commercial kitchens and elementary schools.",
            "Track ER visits for acute gastroenteritis dehydration."
        ]
    },
    {
        "id": "ALT-2026-005",
        "region_id": "UK-LON",
        "region_name": "London, UK",
        "disease": "Influenza-Like Illness (ILI)",
        "symptom_cluster": "Febrile Myalgia, Shivering, Dry Cough",
        "risk_tier": "High",
        "risk_score": 71.8,
        "anomaly_z_score": 2.54,
        "detected_velocity": "+42.1% weekly volume spike",
        "status": "Acknowledged",
        "verification_status": "Unverified Public Health Signal",
        "first_detected": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d %H:%M"),
        "last_updated": (datetime.now() - timedelta(hours=5)).strftime("%Y-%m-%d %H:%M"),
        "trigger_explanation": "Strong convergence between university student message boards and pharmacy cold & flu medication queries in Greater London.",
        "recommended_protocol": [
            "Query NHS 111 telephony symptom call records for respiratory clusters.",
            "Assess ICU and respiratory bed occupancy in North and South London trusts."
        ]
    }
]

def generate_historical_time_series(days: int = 30) -> List[Dict[str, Any]]:
    """Generate realistic 30-day surveillance time-series."""
    base_date = datetime.now() - timedelta(days=days)
    series = []
    
    # Base signal trajectory simulating seasonal baseline + recent outbreak surge
    base_val = 320.0
    for i in range(days):
        current_date = base_date + timedelta(days=i)
        day_str = current_date.strftime("%Y-%m-%d")
        
        # Surge occurs in last 10 days
        if i >= 20:
            surge = (i - 19) * 35.0 + random.uniform(-15, 20)
        else:
            surge = random.uniform(-20, 25)

        total_signals = round(base_val + surge)
        baseline = round(310.0 + (i * 2.5))
        z_score = round((total_signals - baseline) / 42.0, 2)
        confirmed_cases = round(total_signals * 2.8 + random.uniform(-40, 50))

        series.append({
            "date": day_str,
            "social_signals": total_signals,
            "baseline": baseline,
            "confirmed_cases": confirmed_cases,
            "z_score": z_score,
            "is_anomaly": z_score >= 2.0,
            "respiratory": round(total_signals * 0.44),
            "febrile": round(total_signals * 0.28),
            "gastrointestinal": round(total_signals * 0.16),
            "fatigue": round(total_signals * 0.08),
            "vector": round(total_signals * 0.04)
        })

    return series
