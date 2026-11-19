/**
 * SentiPulse - REST API Server (Node.js Engine)
 * Runs with zero external npm dependencies using Node.js built-in HTTP module.
 * Serves live surveillance telemetry, NLP analysis, outbreak prediction forecasts,
 * interactive map data, and SentiPulse Intelligence agent reasoning.
 */

import http from 'http';
import { parse as parseUrl } from 'url';
import { 
  INITIAL_REGIONS, 
  INITIAL_POSTS, 
  INITIAL_ALERTS, 
  HISTORICAL_30D_DATA, 
  SYMPTOM_TAXONOMY_INFO 
} from '../src/data/mockData.js';
import { runClientAgentQuery } from '../src/services/clientAgent.js';
import { classifySocialPost, anonymizeText } from '../src/services/clientNlp.js';
import { calculateRiskScore, generateForecast } from '../src/services/clientPrediction.js';

const PORT = process.env.PORT || 8000;

// Mutable in-memory state initialized from mockData
let regionsDb = JSON.parse(JSON.stringify(INITIAL_REGIONS));
let postsDb = JSON.parse(JSON.stringify(INITIAL_POSTS));
let alertsDb = JSON.parse(JSON.stringify(INITIAL_ALERTS));
let historicalData = JSON.parse(JSON.stringify(HISTORICAL_30D_DATA));

function setCorsHeaders(res, status = 200, contentType = 'application/json') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = parseUrl(req.url, true);
  const path = parsed.pathname;
  const query = parsed.query;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res, 204);
    return res.end();
  }

  // 1. Health Check
  if (req.method === 'GET' && path === '/api/health') {
    setCorsHeaders(res, 200);
    return res.end(JSON.stringify({
      status: 'healthy',
      system: 'SentiPulse Surveillance Engine',
      version: '2.4.0',
      runtime: `Node.js ${process.version}`,
      timestamp: new Date().toISOString(),
      mode: 'Active SentiPulse REST Engine'
    }));
  }

  // 2. Main Dashboard Overview
  if (req.method === 'GET' && path === '/api/overview') {
    const totalPostsAnalyzed = 438920;
    const totalSignalsDetected = regionsDb.reduce((acc, r) => acc + (r.active_signals || 0), 0);
    const emergingAnomalies = postsDb.filter(p => p.is_anomaly).length;

    const topSymptoms = [
      { category: "Respiratory Illness", percentage: 42.5, count: 4820, trend: "+18.4%" },
      { category: "Febrile & Systemic", percentage: 26.8, count: 3040, trend: "+12.1%" },
      { category: "Gastrointestinal", percentage: 16.4, count: 1860, trend: "+24.5%" },
      { category: "Fatigue & Neurological", percentage: 8.7, count: 988, trend: "-2.1%" },
      { category: "Vector-Borne / Rash", percentage: 5.6, count: 635, trend: "+32.0%" }
    ];

    setCorsHeaders(res, 200);
    return res.end(JSON.stringify({
      total_posts_analyzed: totalPostsAnalyzed,
      total_signals_detected: totalSignalsDetected,
      emerging_anomalous_signals: emergingAnomalies || 34,
      overall_risk_level: "High",
      overall_risk_score: 76.4,
      active_alerts_count: alertsDb.filter(a => a.status === 'Active' || a.status === 'Under Review').length,
      top_symptoms: topSymptoms,
      last_data_update: new Date().toUTCString(),
      time_series_30d: historicalData,
      disclaimer: "Predictions are simulated estimates for demonstration and research, not medical diagnoses or officially confirmed outbreaks."
    }));
  }

  // 3. Social Media Signals
  if (req.method === 'GET' && path === '/api/social-signals') {
    let filtered = postsDb;
    if (query.symptom) {
      filtered = filtered.filter(p => p.symptom_category === query.symptom);
    }
    if (query.region) {
      filtered = filtered.filter(p => p.region_id === query.region);
    }

    setCorsHeaders(res, 200);
    return res.end(JSON.stringify({
      count: filtered.length,
      signals: filtered,
      taxonomy: SYMPTOM_TAXONOMY_INFO
    }));
  }

  // 4. Geographic Map Nodes / Regions
  if (req.method === 'GET' && path === '/api/map/regions') {
    setCorsHeaders(res, 200);
    return res.end(JSON.stringify({
      regions: regionsDb,
      legend: [
        { tier: "Low", range: "0 - 34%", color: "#10b981", desc: "Discussion in line with historical baseline" },
        { tier: "Moderate", range: "35 - 59%", color: "#f59e0b", desc: "Slight upward shift in syndromic mentions" },
        { tier: "High", range: "60 - 79%", color: "#f97316", desc: "Statistically elevated discussion velocity (Z >= 2.0)" },
        { tier: "Critical", range: "80 - 100%", color: "#ef4444", desc: "Severe anomaly with high multi-symptom co-occurrence" }
      ]
    }));
  }

  // 5. Outbreak Predictions
  if (req.method === 'GET' && path === '/api/predictions') {
    const regionId = query.region || 'US-NY';
    const horizon = parseInt(query.horizon || '14', 10);
    const selectedRegion = regionsDb.find(r => r.id === regionId) || regionsDb[0];

    const forecast = generateForecast(historicalData, horizon);
    const growthRate = ((selectedRegion.active_signals - selectedRegion.baseline_signals) / selectedRegion.baseline_signals) * 100;
    
    const riskAnalysis = calculateRiskScore({
      currentVolume: selectedRegion.active_signals,
      baselineMean: selectedRegion.baseline_signals,
      zScore: selectedRegion.anomaly_z,
      growthRatePct: growthRate,
      syndromicSeverity: 2.4
    });

    setCorsHeaders(res, 200);
    return res.end(JSON.stringify({
      region: selectedRegion,
      horizon_days: horizon,
      risk_analysis: riskAnalysis,
      forecast: forecast,
      historical: historicalData.slice(-14),
      baseline_divergence: Number((selectedRegion.active_signals / Math.max(1, selectedRegion.baseline_signals)).toFixed(2)),
      confidence_level_note: "Uncertainty cones reflect 80% and 95% forecast intervals based on empirical time-series variance."
    }));
  }

  // 6. Early Warning Alerts
  if (req.method === 'GET' && path === '/api/alerts') {
    let filtered = alertsDb;
    if (query.status) {
      filtered = filtered.filter(a => a.status === query.status);
    }
    setCorsHeaders(res, 200);
    return res.end(JSON.stringify({
      total: alertsDb.length,
      count: filtered.length,
      alerts: filtered
    }));
  }

  // 7. Reports & Summary Export
  if (req.method === 'GET' && path === '/api/reports/summary') {
    const summary = {
      report_id: `REP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`,
      generated_at: new Date().toISOString(),
      reporting_period: "Past 30 Days (Rolling)",
      executive_summary: "Surveillance indicators show a prominent surge in respiratory illness signals centered in the Northeast US and Greater London, with secondary gastrointestinal clusters in Central Texas. Dengue activity in São Paulo remains in critical alert status.",
      regional_rankings: [...regionsDb].sort((a, b) => b.risk_score - a.risk_score),
      syndromic_breakdown: [
        { symptom: "High Fever & Chills", mentions: 3040, z_score: 2.84, severity: "High" },
        { symptom: "Dry / Productive Cough", mentions: 4820, z_score: 3.42, severity: "Critical" },
        { symptom: "Nausea & Vomiting", mentions: 1860, z_score: 2.15, severity: "Elevated" },
        { symptom: "Dyspnea / Shortness of Breath", mentions: 890, z_score: 2.90, severity: "Critical" },
        { symptom: "Retro-Orbital Pain", mentions: 635, z_score: 3.65, severity: "Critical" }
      ],
      model_parameters: {
        anomaly_detection: "Rolling 14-day Z-score with MAD thresholding",
        forecast_model: "Damped Exponential Smoothing with Poisson dispersion",
        disclaimer: "Simulated Research Prototype - Not intended for diagnostic or clinical triage."
      }
    };
    setCorsHeaders(res, 200);
    return res.end(JSON.stringify(summary));
  }

  // 8. CSV Export
  if (req.method === 'GET' && path === '/api/reports/export.csv') {
    const header = "RegionID,RegionName,Country,RiskTier,RiskScore,ActiveSignals,BaselineSignals,AnomalyZScore,TopSymptom,ActiveDisease,ConfirmedCases7d\n";
    const rows = regionsDb.map(r => 
      `"${r.id}","${r.name}","${r.country}","${r.risk_tier}",${r.risk_score},${r.active_signals},${r.baseline_signals},${r.anomaly_z},"${r.top_symptom}","${r.active_disease}",${r.confirmed_cases_7d}`
    ).join("\n");

    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="sentipulse_surveillance_export.csv"',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(header + rows);
  }

  // 9. Agent Query Suggestions
  if (req.method === 'GET' && path === '/api/agent/suggestions') {
    setCorsHeaders(res, 200);
    return res.end(JSON.stringify({
      suggestions: [
        "From which area is Dengue dominating?",
        "Which regions are currently at Critical risk?",
        "Compare the outbreak indicators between New York and California",
        "What symptoms are surging most rapidly this week?",
        "What public health interventions are recommended for São Paulo?",
        "How is the Anomaly Z-Score and outbreak risk score calculated?",
        "What is the forecast trajectory for the next 14 to 30 days?",
        "Are there any unverified early warning alerts needing triage?"
      ]
    }));
  }

  // POST 1. NLP Analysis Endpoint
  if (req.method === 'POST' && path === '/api/social-signals/analyze') {
    const body = await parseJsonBody(req);
    const text = body.text || '';
    if (!text) {
      setCorsHeaders(res, 400);
      return res.end(JSON.stringify({ error: "Field 'text' is required" }));
    }

    const result = classifySocialPost(text);

    if (body.persist && result.is_health_related) {
      const newPost = {
        id: `post-${postsDb.length + 101}`,
        raw_text: text,
        anonymized_text: result.anonymized_text,
        platform: body.platform || "User Ingested Post",
        region_id: body.region_id || "US-NY",
        timestamp: new Date().toISOString(),
        symptom_category: result.category_label,
        detected_symptoms: result.detected_symptoms,
        confidence: result.confidence_score,
        is_health_related: true,
        is_anomaly: result.syndromic_weight >= 4.0,
        urgency: result.urgency_level,
        verified_by_agency: false
      };
      postsDb.unshift(newPost);
    }

    setCorsHeaders(res, 200);
    return res.end(JSON.stringify(result));
  }

  // POST 2. Update Alert Status
  if (req.method === 'POST' && path.startsWith('/api/alerts/') && path.endsWith('/status')) {
    const parts = path.split('/').filter(Boolean);
    const alertId = parts[2];
    const body = await parseJsonBody(req);
    const newStatus = body.status || 'Acknowledged';

    const targetAlert = alertsDb.find(a => a.id === alertId);
    if (!targetAlert) {
      setCorsHeaders(res, 404);
      return res.end(JSON.stringify({ error: "Alert not found" }));
    }

    targetAlert.status = newStatus;
    targetAlert.last_updated = new Date().toISOString().slice(0, 16).replace('T', ' ');
    if (body.notes) {
      targetAlert.review_notes = body.notes;
    }

    setCorsHeaders(res, 200);
    return res.end(JSON.stringify({
      message: `Alert ${alertId} status updated to ${newStatus}`,
      alert: targetAlert
    }));
  }

  // POST 3. Agent Chat / Query
  if (req.method === 'POST' && (path === '/api/agent/chat' || path === '/api/agent/query')) {
    const body = await parseJsonBody(req);
    const userQuery = body.query || '';
    if (!userQuery) {
      setCorsHeaders(res, 400);
      return res.end(JSON.stringify({ error: "Field 'query' is required" }));
    }

    const responsePayload = runClientAgentQuery(userQuery, regionsDb, alertsDb);
    setCorsHeaders(res, 200);
    return res.end(JSON.stringify(responsePayload));
  }

  // Not Found
  setCorsHeaders(res, 404);
  return res.end(JSON.stringify({ error: "Endpoint not found" }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`============================================================`);
  console.log(` SentiPulse REST Server running on http://localhost:${PORT}`);
  console.log(` Telemetry Endpoint: http://localhost:${PORT}/api/overview`);
  console.log(` Health Check:       http://localhost:${PORT}/api/health`);
  console.log(`============================================================`);
});
