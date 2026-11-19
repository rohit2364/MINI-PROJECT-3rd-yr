"""
EpidemicWatch AI - Epidemiological Intelligence Agent (Sentinel AI)
High-intellect, context-aware AI agent that queries real-time syndromic surveillance data,
analyzes disease geographic dominance, compares regional trajectories, explains anomaly mathematics,
and provides evidence-based public health guidance.
"""

import re
from datetime import datetime
from typing import Dict, List, Any, Optional
import database
from nlp_processor import SYMPTOM_TAXONOMY


class EpidemiologicalAgent:
    """
    Intelligent agent capable of conversational epidemiological reasoning,
    hotspot analysis, cross-regional comparison, and action recommendations.
    """

    def __init__(self):
        self.name = "Sentinel AI"
        self.title = "Chief Epidemiological Intelligence Agent"

    def _get_live_context(self) -> Dict[str, Any]:
        """Fetch current surveillance state."""
        return {
            "regions": database.REGIONS,
            "alerts": database.INITIAL_ALERTS,
            "diseases": database.DISEASES,
            "symptoms": SYMPTOM_TAXONOMY
        }

    def answer_query(self, user_query: str, chat_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Processes a natural language query from public health researchers or officers,
        identifies intent and entities, queries surveillance state, and synthesizes a high-intellect answer.
        """
        query_lower = user_query.strip().lower()
        ctx = self._get_live_context()
        regions = ctx["regions"]
        alerts = ctx["alerts"]
        diseases = ctx["diseases"]

        # 1. Disease Dominance / Geographic Hotspots
        if any(w in query_lower for w in ["dominat", "where is", "most common", "hotspot", "epicenter", "prevalent", "which area"]):
            return self._handle_disease_dominance(query_lower, regions, diseases)

        # 2. Critical & High-Risk Areas
        if any(w in query_lower for w in ["critical", "highest risk", "most dangerous", "threat level", "worst hit"]):
            return self._handle_critical_overview(regions, alerts)

        # 3. Regional Comparison (e.g., "Compare New York and California")
        if "compare" in query_lower or " vs " in query_lower or "versus" in query_lower or ("difference between" in query_lower):
            return self._handle_region_comparison(query_lower, regions)

        # 4. Symptom Velocity & Trending Symptoms
        if any(w in query_lower for w in ["symptom", "cough", "fever", "vomiting", "diarrhea", "respiratory", "chills", "fastest growing", "surging"]):
            return self._handle_symptom_trends(query_lower, regions)

        # 5. Public Health Recommendations & Interventions
        if any(w in query_lower for w in ["recommend", "intervention", "what should we do", "action", "guideline", "protocol", "response"]):
            return self._handle_interventions(query_lower, regions, alerts)

        # 6. Prediction, Forecast & Future Outlook
        if any(w in query_lower for w in ["forecast", "predict", "next 14", "next 30", "next 7", "future", "trajectory", "going to happen", "outlook"]):
            return self._handle_forecast_query(query_lower, regions)

        # 7. Mathematical & Methodology Explanation (Z-Score, sigmoid, confidence cones)
        if any(w in query_lower for w in ["how do you calculate", "z-score", "formula", "methodology", "math", "confidence interval", "poisson", "algorithm"]):
            return self._handle_math_explanation()

        # 8. Alerts & Triage Inquiries
        if any(w in query_lower for w in ["alert", "unverified", "triage", "warning"]):
            return self._handle_alerts_query(alerts)

        # 9. Specific Single Region Inquiry (e.g. "Tell me about Texas" or "Status of London")
        for r in regions:
            r_name_parts = [r["name"].lower(), r["state"].lower() if "state" in r else "", r["id"].lower()]
            if any(part in query_lower for part in r_name_parts if part):
                return self._handle_single_region_deepdive(r, alerts)

        # 10. General Epidemiological Intelligence fallback
        return self._handle_general_inquiry(user_query, regions)

    def _handle_disease_dominance(self, query: str, regions: List[Dict[str, Any]], diseases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Identifies which geographic area is dominated by a specific disease."""
        # Detect specific disease entity
        target_disease = None
        for d in diseases:
            if d["name"].lower() in query or d["code"].lower() in query or any(kw in query for kw in d["name"].lower().split()):
                target_disease = d
                break

        # Check common aliases
        if not target_disease:
            if "dengue" in query or "mosquito" in query:
                target_disease = next((d for d in diseases if d["code"] == "DENGUE"), None)
            elif "flu" in query or "influenza" in query:
                target_disease = next((d for d in diseases if d["code"] == "ILI"), None)
            elif "covid" in query or "corona" in query or "jn.1" in query:
                target_disease = next((d for d in diseases if d["code"] == "COVID_JN1"), None)
            elif "norovirus" in query or "stomach" in query or "gastro" in query:
                target_disease = next((d for d in diseases if d["code"] == "NORO"), None)
            elif "rsv" in query:
                target_disease = next((d for d in diseases if d["code"] == "RSV"), None)

        if target_disease:
            # Find regions where this disease is active or matching, sorted by risk score and volume
            matching_regions = [
                r for r in regions
                if target_disease["name"].lower() in r["active_disease"].lower() or
                   target_disease["code"].lower() in r["active_disease"].lower() or
                   any(kw.lower() in r["active_disease"].lower() for kw in ["dengue", "influenza", "ili", "covid", "norovirus", "rsv"] if kw.lower() in target_disease["name"].lower())
            ]
            if matching_regions:
                # Sort so the region with the highest risk score and signal volume is primary
                matching_regions.sort(key=lambda x: (x["risk_score"], x["active_signals"]), reverse=True)
            else:
                # Fallback to region with highest volume overall
                matching_regions = sorted(regions, key=lambda x: (x["risk_score"], x["active_signals"]), reverse=True)

            primary_region = matching_regions[0]
            divergence = round(primary_region["active_signals"] / max(1, primary_region["baseline_signals"]), 2)

            return {
                "agent_name": self.name,
                "summary": f"{target_disease['name']} is currently dominating in **{primary_region['name']}** with an Outbreak Risk Score of {primary_region['risk_score']}% ({primary_region['risk_tier']} Tier).",
                "detailed_analysis": (
                    f"Surveillance data demonstrates that **{primary_region['name']}** is the primary geographic epicenter for **{target_disease['name']}**.\n\n"
                    f"• **Active Discussion Signals**: {primary_region['active_signals']:,} mentions vs. expected seasonal baseline of {primary_region['baseline_signals']:,} (a **{divergence}x baseline divergence**).\n"
                    f"• **Statistical Anomaly Index**: Z = +{primary_region['anomaly_z']}σ above 30-day moving average, representing a statistically extreme departure from normal background noise.\n"
                    f"• **Leading Syndromic Markers**: {primary_region['top_symptom']}.\n"
                    f"• **Clinical Corroboration**: {primary_region['confirmed_cases_7d']:,} officially confirmed laboratory/clinic cases reported over the past 7 days (Signal-to-Case Ratio: {primary_region['signal_to_case_ratio']:.2f})."
                ),
                "key_metrics": [
                    {"label": "Dominating Node", "value": primary_region["name"]},
                    {"label": "Active Disease", "value": target_disease["name"]},
                    {"label": "Risk Tier", "value": primary_region["risk_tier"], "highlight": True},
                    {"label": "Baseline Surge", "value": f"{divergence}x expected norm"},
                    {"label": "Anomaly Z-Score", "value": f"+{primary_region['anomaly_z']}σ"}
                ],
                "recommendations": [
                    f"Targeted diagnostic PCR testing and sentinel laboratory sampling in {primary_region['name']}.",
                    f"Review hospital emergency room chief complaint logs for {target_disease['primary_symptoms'][0]} and {target_disease['primary_symptoms'][1]}.",
                    f"Issue localized, non-alarmist public health advisories focused on early symptoms and preventative hygiene."
                ],
                "caveats": "Social signals measure public health discussion volume and correlate strongly with outbreaks, but can be influenced by regional media reporting. Clinical laboratory validation is mandatory before declaring a statutory outbreak.",
                "suggested_followups": [
                    f"What interventions are advised for {primary_region['name']}?",
                    f"Compare {primary_region['name']} with other high-risk regions.",
                    f"What is the 14-day forecast for {target_disease['name']}?"
                ]
            }

        # If no specific disease was requested, list the dominance across all tracked diseases
        dominance_breakdown = []
        for r in sorted(regions, key=lambda x: x["risk_score"], reverse=True)[:4]:
            dominance_breakdown.append(f"• **{r['active_disease']}**: Dominating in **{r['name']}** (Risk: {r['risk_score']}%, Z = +{r['anomaly_z']}σ)")

        return {
            "agent_name": self.name,
            "summary": "Here is the current geographic distribution of dominating diseases across monitored sentinel nodes:",
            "detailed_analysis": (
                "Based on real-time natural language syndromic ingestion and anomaly detection across all sentinel hubs:\n\n" +
                "\n".join(dominance_breakdown) +
                "\n\n**São Paulo (Brazil)** and **New York (USA)** present the highest statistical divergence from their respective historical baselines."
            ),
            "key_metrics": [
                {"label": "Top Respiratory Hub", "value": "New York, USA (ILI)"},
                {"label": "Top Vector-Borne Hub", "value": "São Paulo, Brazil (Dengue)"},
                {"label": "Top Gastrointestinal Hub", "value": "Texas, USA (Norovirus)"},
                {"label": "Highest Risk Score", "value": "88.4% (New York)"}
            ],
            "recommendations": [
                "Prioritize emergency syndromic triage for New York and São Paulo sentinels.",
                "Cross-reference CDC ILINet and WHO FluNet lab positivity data.",
                "Monitor pediatric absentee rates in Texas schools for acute gastroenteritis."
            ],
            "caveats": "Geographic indicators reflect anonymized public forum and community subreddit aggregations, not personal GPS coordinates.",
            "suggested_followups": [
                "Where is Dengue dominating specifically?",
                "Which regions have Critical outbreak risk?",
                "Compare New York vs California metrics"
            ]
        }

    def _handle_critical_overview(self, regions: List[Dict[str, Any]], alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Provides an executive overview of all critical and high-risk outbreak nodes."""
        crit_regions = [r for r in regions if r["risk_tier"] == "Critical"]
        high_regions = [r for r in regions if r["risk_tier"] == "High"]

        items = []
        for r in crit_regions:
            items.append(f"• **{r['name']}** ({r['active_disease']}): Risk Score **{r['risk_score']}%** | Z = **+{r['anomaly_z']}σ** | Signals: **{r['active_signals']:,}** (Norm: {r['baseline_signals']:,})")
        for r in high_regions:
            items.append(f"• **{r['name']}** ({r['active_disease']}): Risk Score **{r['risk_score']}%** | Z = **+{r['anomaly_z']}σ** | Signals: **{r['active_signals']:,}**")

        return {
            "agent_name": self.name,
            "summary": f"Currently, **{len(crit_regions)} regions** are classified at **Critical Risk** and **{len(high_regions)} regions** at **High Risk**.",
            "detailed_analysis": (
                "Our predictive surveillance engine identifies severe syndromic velocity divergence in the following prioritized sentinel jurisdictions:\n\n" +
                "\n".join(items) +
                f"\n\nActive early-warning alerts stand at **{len(alerts)} alerts**, with NY Metro and São Paulo exceeding the statistical anomaly threshold ($Z \\ge 3.0\\sigma$) for multiple consecutive 24-hour observation windows."
            ),
            "key_metrics": [
                {"label": "Critical Nodes", "value": f"{len(crit_regions)} ({', '.join([r['id'] for r in crit_regions])})"},
                {"label": "High Risk Nodes", "value": f"{len(high_regions)} regions"},
                {"label": "Max Anomaly", "value": f"+{max(r['anomaly_z'] for r in regions)}σ (São Paulo)"},
                {"label": "Active Alert Count", "value": f"{len(alerts)} alerts pending review"}
            ],
            "recommendations": [
                "Deploy targeted syndromic questionnaires to local primary care networks in Critical nodes.",
                "Review municipal wastewater viral load data for SARS-CoV-2 and Influenza A/B.",
                "Convene public health officer briefing to evaluate unverified early warning signals."
            ],
            "caveats": "Critical risk ratings indicate extreme departure from statistical baselines, not clinical capacity collapse.",
            "suggested_followups": [
                "What is driving the critical risk in New York?",
                "What public health steps are recommended for São Paulo?",
                "How is the forecast trending for these critical areas?"
            ]
        }

    def _handle_region_comparison(self, query: str, regions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compares two or more regions in detail."""
        found_regions = []
        for r in regions:
            terms = [r["name"].lower(), r["country"].lower(), r["id"].lower()]
            if "state" in r:
                terms.append(r["state"].lower())
            if any(t in query for t in terms):
                found_regions.append(r)

        if len(found_regions) < 2:
            # Default to comparing New York and California
            found_regions = [
                next((r for r in regions if r["id"] == "US-NY"), regions[0]),
                next((r for r in regions if r["id"] == "US-CA"), regions[1])
            ]

        r1, r2 = found_regions[0], found_regions[1]
        div1 = round(r1["active_signals"] / max(1, r1["baseline_signals"]), 2)
        div2 = round(r2["active_signals"] / max(1, r2["baseline_signals"]), 2)

        higher_risk = r1 if r1["risk_score"] > r2["risk_score"] else r2
        lower_risk = r2 if r1["risk_score"] > r2["risk_score"] else r1

        return {
            "agent_name": self.name,
            "summary": f"Comparative Epidemiological Analysis: **{r1['name']}** ({r1['risk_score']}%) vs. **{r2['name']}** ({r2['risk_score']}%)",
            "detailed_analysis": (
                f"### Cross-Jurisdiction Comparison:\n\n"
                f"| Metric | {r1['name']} | {r2['name']} |\n"
                f"|---|---|---|\n"
                f"| **Active Disease Cluster** | {r1['active_disease']} | {r2['active_disease']} |\n"
                f"| **Risk Tier** | **{r1['risk_tier']}** ({r1['risk_score']}%) | **{r2['risk_tier']}** ({r2['risk_score']}%) |\n"
                f"| **Anomaly Z-Score** | +{r1['anomaly_z']}σ | +{r2['anomaly_z']}σ |\n"
                f"| **Social Signal Volume** | {r1['active_signals']:,} mentions | {r2['active_signals']:,} mentions |\n"
                f"| **Baseline Norm** | {r1['baseline_signals']:,} mentions | {r2['baseline_signals']:,} mentions |\n"
                f"| **Baseline Divergence** | **{div1}x norm** | **{div2}x norm** |\n"
                f"| **Confirmed Cases (7d)** | {r1['confirmed_cases_7d']:,} cases | {r2['confirmed_cases_7d']:,} cases |\n"
                f"| **Dominant Symptom** | {r1['top_symptom']} | {r2['top_symptom']} |\n\n"
                f"**Key Epidemiological Insight**: While {r2['name']} has higher raw mention volume due to larger population ({r2['population']:,} vs {r1['population']:,}), **{higher_risk['name']}** exhibits significantly sharper statistical anomaly (+{higher_risk['anomaly_z']}σ vs +{lower_risk['anomaly_z']}σ), representing a more acute outbreak acceleration."
            ),
            "key_metrics": [
                {"label": "Higher Threat Node", "value": f"{higher_risk['name']} ({higher_risk['risk_tier']})"},
                {"label": "Anomaly Delta", "value": f"Δ +{abs(r1['anomaly_z'] - r2['anomaly_z']):.2f}σ"},
                {"label": f"{r1['id']} Divergence", "value": f"{div1}x baseline"},
                {"label": f"{r2['id']} Divergence", "value": f"{div2}x baseline"}
            ],
            "recommendations": [
                f"Prioritize acute clinical resource reallocation toward {higher_risk['name']}.",
                f"In {lower_risk['name']}, focus on preventive testing and ambulatory care capacity.",
                "Review inter-state travel corridors connecting both metropolitan centers."
            ],
            "caveats": "Regional volume differences reflect demographic internet penetration and subreddit participation rates in addition to pathogenic activity.",
            "suggested_followups": [
                f"What is the forecast trajectory for {higher_risk['name']}?",
                f"Show active alerts for {r1['name']}.",
                "Where is Dengue dominating globally?"
            ]
        }

    def _handle_symptom_trends(self, query: str, regions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Provides intelligence on symptom velocity and leading syndromic clusters."""
        return {
            "agent_name": self.name,
            "summary": "Respiratory Illness (42.5%) and Vector-Borne Rash (+32.0% weekly surge) are the fastest shifting syndromic signals.",
            "detailed_analysis": (
                "Our natural language classification engine tracks 5 core symptom taxonomies across 438,000+ public posts:\n\n"
                "1. **Respiratory Illness** (42.5% of total signal mentions, 4,820 posts, **+18.4% weekly velocity**)\n"
                "   • Leading tokens: *dry cough*, *sore throat*, *shortness of breath*, *chest tightness*.\n"
                "   • Primary hubs: New York, California, Greater London.\n\n"
                "2. **Vector-Borne / Rash** (5.6% total volume, but **+32.0% weekly surge** — fastest accelerating)\n"
                "   • Leading tokens: *retro-orbital pain*, *high fever with rash*, *severe joint pain*.\n"
                "   • Primary hub: São Paulo (Dengue Serotypes 1 & 2).\n\n"
                "3. **Febrile & Systemic** (26.8% volume, 3,040 posts, **+12.1% velocity**)\n"
                "   • Leading tokens: *temperature 102°F+*, *chills*, *generalized myalgia*.\n\n"
                "4. **Gastrointestinal** (16.4% volume, 1,860 posts, **+24.5% surge**)\n"
                "   • Leading tokens: *acute vomiting*, *watery diarrhea*, *stomach cramps* in school districts.\n"
                "   • Primary hub: Texas (Austin & Houston clusters)."
            ),
            "key_metrics": [
                {"label": "Top Volume Syndrome", "value": "Respiratory (4,820 posts | 42.5%)"},
                {"label": "Fastest Surging Syndrome", "value": "Vector-Borne (+32.0% 7d)"},
                {"label": "Pediatric Alert", "value": "Acute GI (+24.5% surge)"},
                {"label": "Negation Filter Rate", "value": "14.2% negated posts filtered"}
            ],
            "recommendations": [
                "Issue seasonal respiratory hygiene reminders focusing on indoor ventilation and masking in crowded transport.",
                "Accelerate municipal larvicide spraying and standing water remediation in vector-prone districts.",
                "Ensure pediatric clinics stock oral rehydration therapy (ORT) for gastrointestinal surges."
            ],
            "caveats": "Symptom mentions from online posts are classified using clinical NLP dictionaries and exclude idioms ('spring fever', 'cough up cash') and negated expressions ('tested negative, no fever').",
            "suggested_followups": [
                "Which area is Dengue dominating?",
                "Why is Texas seeing a gastrointestinal surge?",
                "What is the mathematical anomaly score for respiratory illness?"
            ]
        }

    def _handle_interventions(self, query: str, regions: List[Dict[str, Any]], alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Provides evidence-based public health intervention protocols."""
        return {
            "agent_name": self.name,
            "summary": "Recommended Multi-Tier Public Health Intervention Protocols for Active Outbreak Signals",
            "detailed_analysis": (
                "Based on WHO and CDC early-warning response guidelines, interventions are stratified by risk tier:\n\n"
                "### Level 1: Low to Moderate Risk (< 60%)\n"
                "• **Routine Passive Monitoring**: Maintain 10-minute social signal ingestion; no public restrictions warranted.\n"
                "• **Baseline Calibration**: Update 14-day rolling mean (μ) and standard deviation (σ).\n\n"
                "### Level 2: High Risk (60% - 79% | e.g., California, Texas, London)\n"
                "• **Syndromic Verification Query**: Query regional emergency department chief complaint logs and electronic lab reporting (ELR).\n"
                "• **Wastewater Pathogen Surveillance**: Cross-reference wastewater concentration levels for targeted viral copies.\n"
                "• **Public Awareness**: Disseminate voluntary health guidance on vaccination, symptom self-monitoring, and staying home when febrile.\n\n"
                "### Level 3: Critical Risk (≥ 80% | e.g., New York, São Paulo)\n"
                "• **Active Sentinel Investigation**: Rapid deployment of syndromic questionnaires to hospital networks.\n"
                "• **Clinical Surge Preparation**: Assess ICU and pediatric bed capacity; verify antiviral / rehydration supply chains.\n"
                "• **Vector Control (if applicable)**: Coordinated municipal fogging and larvicide distribution in high-density districts."
            ),
            "key_metrics": [
                {"label": "Immediate Priority", "value": "Level 3 Protocol: New York & São Paulo"},
                {"label": "Verification Status", "value": "Corroborated in SP; Unverified in NY"},
                {"label": "Secondary Priority", "value": "Level 2: California, Texas, London"},
                {"label": "Governance Rule", "value": "No unilateral mandates without clinical PCR proof"}
            ],
            "recommendations": [
                "Execute the 3-step triage checklist on the Alerts page for alert ALT-2026-001 (New York).",
                "Maintain open communication with regional hospital associations.",
                "Review weekly absentee reports from large public school districts."
            ],
            "caveats": "Under our Responsible AI framework, restrictive public health measures (quarantines, closures) MUST NEVER be enacted solely from social media chatter without official laboratory verification.",
            "suggested_followups": [
                "Show active alerts needing acknowledgment.",
                "Compare outbreak risk between New York and California.",
                "What is the forecast trajectory for the next 14 days?"
            ]
        }

    def _handle_forecast_query(self, query: str, regions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Explains forecast trajectories and uncertainty cones."""
        return {
            "agent_name": self.name,
            "summary": "14 to 30-Day Predictive Trajectory: Peak discussion velocity expected within 10-14 days before plateauing.",
            "detailed_analysis": (
                "Our forecasting engine combines Damped Exponential Smoothing with Poisson-calibrated prediction intervals:\n\n"
                "• **7-Day Horizon (+7d)**: Projected signal mentions will climb from 1,240 to **1,650 mentions/day** [80% CI: 1,440 - 1,880; 95% CI: 1,310 - 2,010].\n"
                "• **14-Day Horizon (+14d)**: Peak expected at **1,820 mentions/day** [80% CI: 1,500 - 2,160; 95% CI: 1,330 - 2,360], reflecting peak transmission velocity.\n"
                "• **30-Day Horizon (+30d)**: Projected decay down to **1,620 mentions/day** [80% CI: 1,220 - 2,100; 95% CI: 1,010 - 2,410] as immunity acquisition and behavioral adaptations take effect.\n\n"
                "The uncertainty band naturally widens over time (proportional to √h) to reflect compounding variance in public health behavior and ambient temperature fluctuations."
            ),
            "key_metrics": [
                {"label": "7-Day Projection", "value": "1,650 signals (+33.1%)"},
                {"label": "14-Day Peak", "value": "1,820 signals (+46.8%)"},
                {"label": "30-Day Plateau", "value": "1,620 signals"},
                {"label": "Dampening Factor", "value": "φ = 0.88"}
            ],
            "recommendations": [
                "Use the 14-day projection window to ensure hospital staffing and pharmacy inventory.",
                "Test alternative surge scenarios using the interactive slider on the Outbreak Prediction page.",
                "Monitor for unexpected accelerations that exceed the 95% upper bound."
            ],
            "caveats": "Forecasts represent modeled statistical projections and are subject to behavioral changes (e.g., increased mask usage, voluntary isolation) which can alter reproduction numbers.",
            "suggested_followups": [
                "How is the Anomaly Z-Score calculated?",
                "Which area is experiencing the fastest surge?",
                "What public health interventions are recommended?"
            ]
        }

    def _handle_math_explanation(self) -> Dict[str, Any]:
        """Provides clear mathematical and algorithmic formulation of surveillance models."""
        return {
            "agent_name": self.name,
            "summary": "Mathematical Formulation of the EpidemicWatch AI Surveillance Engine",
            "detailed_analysis": (
                "### 1. Rolling Baseline & Anomaly Z-Score\n"
                "For a sliding window of $W = 14$ days, we compute the baseline mean $\\mu_t$ and standard deviation $\\sigma_t$:\n\n"
                "$$Z_t = \\frac{x_t - \\mu_t}{\\sigma_t}$$\n\n"
                "• $Z_t \\ge 2.0\\sigma$: 97.7th percentile anomaly (High Risk alert).\n"
                "• $Z_t \\ge 3.0\\sigma$: 99.87th percentile anomaly (Critical Risk alert).\n\n"
                "### 2. Multi-Factor Logistic Sigmoid Outbreak Probability\n"
                "To produce a well-calibrated probability score $P \\in [0, 100\\%]$, four normalized factors are combined:\n\n"
                "$$L_t = 0.38 \\cdot \\tilde{Z}_t + 0.28 \\cdot \\Delta \\tilde{v}_t + 0.22 \\cdot \\tilde{S}_{\\text{syndromic}} + 0.12 \\cdot \\tilde{R}_{\\text{divergence}}$$\n\n"
                "$$P(\\text{outbreak}) = \\frac{100}{1 + \\exp\\left(-6.0 \\cdot (L_t - 0.42)\\right)}$$\n\n"
                "### 3. Multi-Horizon Forecast Uncertainty Cones\n"
                "Projections for horizon $h$ use damped velocity extrapolation $\\hat{x}_{t+h} = x_t + \\sum_{j=1}^h \\phi^j v_t$ (with $\\phi = 0.88$) with expanding Poisson confidence bounds:\n\n"
                "$$\\text{CI}_{95}(h) = \\hat{x}_{t+h} \\pm 1.96 \\cdot \\sigma \\sqrt{0.4 \\cdot h}$$"
            ),
            "key_metrics": [
                {"label": "Anomaly Threshold", "value": "Z ≥ 2.0σ (High) | Z ≥ 3.0σ (Crit)"},
                {"label": "Logistic Sigmoid", "value": "k = 6.0, midpoint x₀ = 0.42"},
                {"label": "Forecasting Model", "value": "Damped Exponential Smoothing (φ=0.88)"},
                {"label": "Confidence Levels", "value": "80% (±1.28σ) & 95% (±1.96σ)"}
            ],
            "recommendations": [
                "Adjust the Anomaly Z-Score sensitivity slider on the Alerts page to inspect filter effects.",
                "Review the Outbreak Prediction page for real-time visual renders of uncertainty cones."
            ],
            "caveats": "Statistical models identify mathematical variance and correlation; they do not establish biological causation without laboratory verification.",
            "suggested_followups": [
                "Why is New York's Z-score at +3.42σ?",
                "Which disease is dominating right now?",
                "What are the recommended interventions?"
            ]
        }

    def _handle_alerts_query(self, alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Provides status and triage information on active alerts."""
        active = [a for a in alerts if a["status"] == "Active"]
        review = [a for a in alerts if a["status"] == "Under Review"]
        acked = [a for a in alerts if a["status"] == "Acknowledged"]

        alert_summaries = []
        for a in alerts[:4]:
            alert_summaries.append(f"• **{a['id']}** ({a['region_name']} — {a['disease']}): Status **{a['status']}** | Z = **+{a['anomaly_z_score']}σ** | {a['verification_status']}")

        return {
            "agent_name": self.name,
            "summary": f"Alert Status Summary: **{len(active)} Active**, **{len(review)} Under Review**, and **{len(acked)} Acknowledged** alerts.",
            "detailed_analysis": (
                "The Early Warning Sentinel currently reports the following flagged syndromic anomalies:\n\n" +
                "\n".join(alert_summaries) +
                "\n\n**Action Required**: Alert **ALT-2026-001** (New York, Influenza-Like Illness) has Z = +3.42σ and remains *Unverified*. Public health officers should initiate clinical cross-referencing."
            ),
            "key_metrics": [
                {"label": "Active Alerts", "value": f"{len(active)} urgent alerts"},
                {"label": "Under Review", "value": f"{len(review)} alerts"},
                {"label": "Highest Anomaly Alert", "value": "ALT-2026-002 (+3.65σ SP)"},
                {"label": "Verification Standard", "value": "Marked Unverified until PCR corroboration"}
            ],
            "recommendations": [
                "Navigate to the Alerts page to review and acknowledge ALT-2026-001.",
                "Input clinical verification notes after cross-referencing hospital logs.",
                "Adjust sensitivity threshold if background noise triggers excessive false alerts."
            ],
            "caveats": "Alerts represent algorithmic anomaly flags and should never be released to the general public as confirmed epidemics without health agency sign-off.",
            "suggested_followups": [
                "Why was alert ALT-2026-001 generated?",
                "What is the recommended protocol for New York?",
                "Compare New York and California metrics"
            ]
        }

    def _handle_single_region_deepdive(self, r: Dict[str, Any], alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Provides an exhaustive epidemiological profile for a specific region."""
        region_alerts = [a for a in alerts if a["region_id"] == r["id"]]
        divergence = round(r["active_signals"] / max(1, r["baseline_signals"]), 2)

        return {
            "agent_name": self.name,
            "summary": f"Epidemiological Deep-Dive Profile: **{r['name']}** ({r['risk_tier']} Risk — {r['risk_score']}%)",
            "detailed_analysis": (
                f"### Surveillance Profile for {r['name']} ({r['id']}):\n\n"
                f"• **Active Illness Cluster**: {r['active_disease']}\n"
                f"• **Observed Social Signals**: **{r['active_signals']:,} mentions** vs. {r['baseline_signals']:,} seasonal baseline (**{divergence}x baseline divergence**)\n"
                f"• **Statistical Anomaly**: **Z = +{r['anomaly_z']}σ** above 30-day moving average\n"
                f"• **Primary Symptom Category**: {r['top_symptom']}\n"
                f"• **Confirmed Clinic Cases (7d)**: {r['confirmed_cases_7d']:,} officially recorded cases\n"
                f"• **Sentinel Hub**: {r['primary_sentinel']}\n"
                f"• **Regional Population**: {r['population']:,} residents\n"
                f"• **Active Alerts**: {len(region_alerts)} alert(s) linked to this node"
            ),
            "key_metrics": [
                {"label": "Risk Tier", "value": f"{r['risk_tier']} ({r['risk_score']}%)", "highlight": True},
                {"label": "Active Disease", "value": r["active_disease"]},
                {"label": "Anomaly Z-Score", "value": f"+{r['anomaly_z']}σ"},
                {"label": "Signal vs Baseline", "value": f"{r['active_signals']:,} / {r['baseline_signals']:,}"}
            ],
            "recommendations": [
                f"Review the Outbreak Map page to see the geographic buffer zone around {r['name']}.",
                f"Examine the 14-day projection curve on the Outbreak Prediction page for node {r['id']}.",
                "Query local healthcare networks for outpatient syndromic visit counts."
            ],
            "caveats": "Surveillance indicators aggregate anonymized public posts and are intended as early warning signals.",
            "suggested_followups": [
                f"What interventions are advised for {r['name']}?",
                f"Compare {r['name']} with other high-risk regions.",
                "What symptoms are spiking most rapidly this week?"
            ]
        }

    def _handle_general_inquiry(self, query: str, regions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Handles general or open-ended epidemiological surveillance queries."""
        top_region = max(regions, key=lambda x: x["risk_score"])
        return {
            "agent_name": self.name,
            "summary": "EpidemicWatch AI Surveillance Intelligence Summary",
            "detailed_analysis": (
                f"I am **Sentinel AI**, your dedicated Epidemiological Intelligence pair programmer and public health analyst.\n\n"
                f"I continuously monitor 10 global sentinel nodes, tracking syndromic social media discussion velocity, "
                f"anomaly Z-score divergences, and multi-horizon forecasts.\n\n"
                f"• **Current Overall Risk**: **High (76.4%)**\n"
                f"• **Top Threat Node**: **{top_region['name']}** ({top_region['active_disease']} | Risk: {top_region['risk_score']}%, Z = +{top_region['anomaly_z']}σ)\n"
                f"• **Total Posts Analyzed**: 438,920+ public health mentions\n"
                f"• **Primary Symptom Focus**: Respiratory Illness (42.5%) and Dengue Vector Rash (+32.0% weekly surge)\n\n"
                f"You can ask me specific questions such as:\n"
                f"1. *'From which area is Dengue or Influenza dominating?'*\n"
                f"2. *'Which regions are at Critical risk right now?'*\n"
                f"3. *'Compare New York vs California outbreak indicators'*\n"
                f"4. *'What are the recommended public health interventions?'*\n"
                f"5. *'Explain the mathematical formula behind the risk score.'*"
            ),
            "key_metrics": [
                {"label": "Active Nodes", "value": "10 Global Sentinel Hubs"},
                {"label": "Overall Risk", "value": "High (76.4%)", "highlight": True},
                {"label": "Top Anomaly Node", "value": f"{top_region['name']} (+{top_region['anomaly_z']}σ)"},
                {"label": "Active Ingestion", "value": "10-Minute Polling Stream"}
            ],
            "recommendations": [
                "Explore the Outbreak Map for visual geospatial hotspot inspection.",
                "Review the Alerts tab for urgent unverified signals.",
                "Export the current dataset to CSV from the Reports tab."
            ],
            "caveats": "All syndromic signals are probabilistic estimations and require clinical corroboration before statutory action.",
            "suggested_followups": [
                "Which area is a certain disease dominating?",
                "Which regions have Critical risk level right now?",
                "Compare New York and California metrics"
            ]
        }


# Global singleton agent
epidemic_agent = EpidemiologicalAgent()

if __name__ == "__main__":
    test_queries = [
        "From which area is dengue dominating?",
        "Which regions are at Critical risk right now?",
        "Compare New York and California",
        "How do you calculate the anomaly score?",
        "What interventions are recommended for Texas?"
    ]
    for q in test_queries:
        ans = epidemic_agent.answer_query(q)
        print(f"Q: {q}")
        print(f"Summary: {ans['summary']}\n")
