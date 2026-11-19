// SentiPulse - API Service Layer with Auto-Fallback

const API_BASE = '/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Backend offline; client will operate in synthetic sentinel mode
  }
  return null;
}

export async function fetchOverviewData() {
  try {
    const res = await fetch(`${API_BASE}/overview`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Fallback handled in context
  }
  return null;
}

export async function fetchSocialSignals(symptom, region) {
  try {
    const params = new URLSearchParams();
    if (symptom) params.append('symptom', symptom);
    if (region) params.append('region', region);
    const res = await fetch(`${API_BASE}/social-signals?${params.toString()}`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}
  return null;
}

export async function analyzeTextRemote(text, persist = false, regionId = "US-NY") {
  try {
    const res = await fetch(`${API_BASE}/social-signals/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, persist, region_id: regionId }),
      signal: AbortSignal.timeout(2500)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}
  return null;
}

export async function fetchPredictions(regionId = "US-NY", horizon = 14) {
  try {
    const res = await fetch(`${API_BASE}/predictions?region=${regionId}&horizon=${horizon}`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}
  return null;
}

export async function updateAlertStatusRemote(alertId, status, notes = "") {
  try {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}
  return null;
}

export async function queryAgentRemote(query, history = []) {
  try {
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history }),
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}
  return null;
}

export async function fetchAgentSuggestionsRemote() {
  try {
    const res = await fetch(`${API_BASE}/agent/suggestions`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return data.suggestions || [];
    }
  } catch (err) {}
  return [];
}
