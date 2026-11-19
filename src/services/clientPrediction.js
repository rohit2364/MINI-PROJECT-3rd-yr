// SentiPulse - Client-side Prediction & Statistical Forecaster

export function calculateRiskScore({
  currentVolume,
  baselineMean,
  zScore,
  growthRatePct,
  syndromicSeverity = 2.0
}) {
  const normZ = Math.min(1.0, Math.max(0.0, zScore / 4.0));
  const normGrowth = Math.min(1.0, Math.max(0.0, growthRatePct / 100.0));
  const normSyndromic = Math.min(1.0, syndromicSeverity / 3.0);
  const volumeRatio = currentVolume / Math.max(1, baselineMean);
  const normRatio = Math.min(1.0, Math.max(0.0, (volumeRatio - 1.0) / 2.0));

  const linear = 0.38 * normZ + 0.28 * normGrowth + 0.22 * normSyndromic + 0.12 * normRatio;
  
  // Sigmoid activation
  const prob = 1.0 / (1.0 + Math.exp(-6.0 * (linear - 0.42)));
  const score = Number((prob * 100).toFixed(1));

  let tier = "Low";
  let color = "#10b981";
  if (score >= 80) {
    tier = "Critical";
    color = "#ef4444";
  } else if (score >= 60) {
    tier = "High";
    color = "#f97316";
  } else if (score >= 35) {
    tier = "Moderate";
    color = "#f59e0b";
  }

  return {
    score,
    tier,
    color,
    volumeRatio: Number(volumeRatio.toFixed(2)),
    factors: [
      {
        name: "Statistical Anomaly (Z-Score)",
        weight: "38%",
        val: `+${zScore.toFixed(1)}σ above baseline`,
        severity: zScore > 2.0 ? "High" : "Normal"
      },
      {
        name: "Discussion Velocity (7d Growth)",
        weight: "28%",
        val: `+${growthRatePct.toFixed(1)}% weekly surge`,
        severity: growthRatePct > 30 ? "High" : "Moderate"
      },
      {
        name: "Syndromic Severity Weight",
        weight: "22%",
        val: `${syndromicSeverity.toFixed(1)} / 3.0 index`,
        severity: syndromicSeverity > 2.2 ? "Severe" : "Moderate"
      },
      {
        name: "Baseline Divergence Multiplier",
        weight: "12%",
        val: `${volumeRatio.toFixed(2)}x expected seasonal norm`,
        severity: volumeRatio > 1.5 ? "Elevated" : "Baseline"
      }
    ]
  };
}

export function generateForecast(history, horizonDays = 14) {
  const points = [];
  const lastVal = history[history.length - 1]?.social_signals || 1200;
  let currentVal = lastVal;
  let velocity = 28.0;

  for (let i = 1; i <= horizonDays; i++) {
    velocity *= 0.88; // Damped velocity
    currentVal += velocity;
    
    const uncertaintyStd = 45.0 * Math.sqrt(i * 0.4);
    points.push({
      day: `+${i}d`,
      projected_signals: Math.round(currentVal),
      lower_80: Math.round(Math.max(0, currentVal - 1.28 * uncertaintyStd)),
      upper_80: Math.round(currentVal + 1.28 * uncertaintyStd),
      lower_95: Math.round(Math.max(0, currentVal - 1.96 * uncertaintyStd)),
      upper_95: Math.round(currentVal + 1.96 * uncertaintyStd)
    });
  }
  return points;
}

export function exportRegionsCSV(regions) {
  const header = "RegionID,RegionName,Country,RiskTier,RiskScore,ActiveSignals,BaselineSignals,AnomalyZScore,TopSymptom,ActiveDisease,ConfirmedCases7d\n";
  const rows = regions.map(r => 
    `"${r.id}","${r.name}","${r.country}","${r.risk_tier}",${r.risk_score},${r.active_signals},${r.baseline_signals},${r.anomaly_z},"${r.top_symptom}","${r.active_disease}",${r.confirmed_cases_7d}`
  ).join("\n");

  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `sentipulse_surveillance_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
