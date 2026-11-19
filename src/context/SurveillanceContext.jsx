import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_REGIONS,
  INITIAL_POSTS,
  INITIAL_ALERTS,
  HISTORICAL_30D_DATA
} from '../data/mockData';
import { classifySocialPost } from '../services/clientNlp';
import { checkBackendHealth, fetchOverviewData, analyzeTextRemote, updateAlertStatusRemote } from '../services/api';

const SurveillanceContext = createContext();

export function SurveillanceProvider({ children }) {
  const [regions, setRegions] = useState(INITIAL_REGIONS);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [timeSeries, setTimeSeries] = useState(HISTORICAL_30D_DATA);
  const [serverOnline, setServerOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [sensitivityThreshold, setSensitivityThreshold] = useState(2.0); // Anomaly Z-score slider
  const [isSimulatingStream, setIsSimulatingStream] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState("US-NY");

  // Attempt backend check
  useEffect(() => {
    let mounted = true;
    async function checkServer() {
      const health = await checkBackendHealth();
      if (mounted) {
        if (health) {
          setServerOnline(true);
          const overview = await fetchOverviewData();
          if (overview && overview.time_series_30d) {
            setTimeSeries(overview.time_series_30d);
          }
        } else {
          setServerOnline(false);
        }
      }
    }
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Live simulation ticker: periodically injects realistic synthetic posts
  useEffect(() => {
    if (!isSimulatingStream) return;

    const streamTemplates = [
      {
        raw: "Several colleagues in Midtown reporting 102 fever and intense body chills today. What's going around?",
        platform: "Reddit (r/nyc)",
        region_id: "US-NY"
      },
      {
        raw: "Elementary school in Dallas reports 15 absences today due to sudden nausea and stomach cramping.",
        platform: "Community Health Board",
        region_id: "US-TX"
      },
      {
        raw: "Extreme joint stiffness and eye pain behind the socket after spending time outdoors in Campinas.",
        platform: "Bluesky",
        region_id: "BR-SP"
      },
      {
        raw: "Doctor's office in Bay Area packed with people coughing up a storm and complaining of shortness of breath.",
        platform: "Reddit (r/bayarea)",
        region_id: "US-CA"
      },
      {
        raw: "Severe throat pain and burning up since Thursday morning. Tested negative for strep.",
        platform: "Public Forum",
        region_id: "UK-LON"
      }
    ];

    const streamTimer = setInterval(() => {
      const template = streamTemplates[Math.floor(Math.random() * streamTemplates.length)];
      const nlpResult = classifySocialPost(template.raw);
      
      const newPost = {
        id: `post-${Date.now()}`,
        raw_text: template.raw,
        anonymized_text: nlpResult.anonymized_text,
        platform: template.platform,
        region_id: template.region_id,
        timestamp: "Just now",
        symptom_category: nlpResult.primary_category,
        detected_symptoms: nlpResult.detected_symptoms,
        confidence: nlpResult.confidence_score,
        is_health_related: nlpResult.is_health_related,
        is_anomaly: nlpResult.urgency_level === "Critical" || nlpResult.urgency_level === "High",
        urgency: nlpResult.urgency_level,
        verified_by_agency: false
      };

      setPosts(prev => [newPost, ...prev.slice(0, 49)]); // keep latest 50
      setLastUpdated(new Date().toLocaleTimeString());
    }, 12000);

    return () => clearInterval(streamTimer);
  }, [isSimulatingStream]);

  // NLP Analyzer function
  const analyzePost = useCallback(async (text, persist = false, regionId = "US-NY") => {
    if (serverOnline) {
      const remoteRes = await analyzeTextRemote(text, persist, regionId);
      if (remoteRes) {
        if (persist && remoteRes.is_health_related) {
          const newPost = {
            id: `post-${Date.now()}`,
            raw_text: text,
            anonymized_text: remoteRes.anonymized_text,
            platform: "User Input Feed",
            region_id: regionId,
            timestamp: "Just now",
            symptom_category: remoteRes.category_label || remoteRes.primary_category,
            detected_symptoms: remoteRes.detected_symptoms,
            confidence: remoteRes.confidence_score,
            is_health_related: true,
            is_anomaly: remoteRes.urgency_level === "Critical",
            urgency: remoteRes.urgency_level,
            verified_by_agency: false
          };
          setPosts(prev => [newPost, ...prev]);
        }
        return remoteRes;
      }
    }

    // Client-side fallback
    const clientRes = classifySocialPost(text);
    if (persist && clientRes.is_health_related) {
      const newPost = {
        id: `post-${Date.now()}`,
        raw_text: text,
        anonymized_text: clientRes.anonymized_text,
        platform: "User Input Feed",
        region_id: regionId,
        timestamp: "Just now",
        symptom_category: clientRes.primary_category,
        detected_symptoms: clientRes.detected_symptoms,
        confidence: clientRes.confidence_score,
        is_health_related: true,
        is_anomaly: clientRes.urgency_level === "Critical",
        urgency: clientRes.urgency_level,
        verified_by_agency: false
      };
      setPosts(prev => [newPost, ...prev]);
    }
    return clientRes;
  }, [serverOnline]);

  // Alert triage
  const updateAlertStatus = useCallback(async (alertId, newStatus, notes = "") => {
    if (serverOnline) {
      await updateAlertStatusRemote(alertId, newStatus, notes);
    }
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: newStatus,
          last_updated: "Just now",
          review_notes: notes || a.review_notes
        };
      }
      return a;
    }));
  }, [serverOnline]);

  const refreshSurveillance = () => {
    setLastUpdated(new Date().toLocaleTimeString());
  };

  return (
    <SurveillanceContext.Provider value={{
      regions,
      posts,
      alerts,
      timeSeries,
      serverOnline,
      lastUpdated,
      sensitivityThreshold,
      setSensitivityThreshold,
      isSimulatingStream,
      setIsSimulatingStream,
      selectedRegionId,
      setSelectedRegionId,
      analyzePost,
      updateAlertStatus,
      refreshSurveillance
    }}>
      {children}
    </SurveillanceContext.Provider>
  );
}

export function useSurveillance() {
  const context = useContext(SurveillanceContext);
  if (!context) throw new Error('useSurveillance must be used within SurveillanceProvider');
  return context;
}
