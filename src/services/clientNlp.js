// SentiPulse - Client-side NLP & Anonymization Engine

const SYMPTOM_KEYWORDS = {
  "Respiratory Illness": [
    "cough", "coughing", "dry cough", "productive cough", "sore throat", "wheezing",
    "shortness of breath", "dyspnea", "chest tightness", "chest congestion", "runny nose",
    "nasal congestion", "sneezing", "bronchitis", "respiratory", "difficulty breathing"
  ],
  "Febrile & Systemic": [
    "fever", "high fever", "low grade fever", "chills", "shivering", "night sweats",
    "body ache", "muscle ache", "myalgia", "rigors", "temperature 102", "temperature 103",
    "burning up", "sweating bullets"
  ],
  "Gastrointestinal": [
    "nausea", "vomiting", "vomit", "threw up", "throwing up", "diarrhea", "stomach bug",
    "stomach flu", "abdominal cramp", "stomach pain", "food poisoning", "gastroenteritis",
    "loose stool", "dehydration"
  ],
  "Fatigue & Neurological": [
    "extreme fatigue", "exhaustion", "brain fog", "loss of taste", "loss of smell",
    "ageusia", "anosmia", "splitting headache", "migraine", "dizziness", "vertigo",
    "cannot get out of bed"
  ],
  "Vector-Borne / Rash": [
    "joint pain", "arthralgia", "petechiae", "skin rash", "retro-orbital pain",
    "eye pain", "mosquito bite", "dengue", "platelet drop"
  ]
};

const NOISE_PATTERNS = [
  /\bcabinc? fever\b/i,
  /\bspring fever\b/i,
  /\bdisco fever\b/i,
  /\bfever pitch\b/i,
  /\bbieber fever\b/i,
  /\bgold fever\b/i,
  /\bcough(ing)? up (the |some )?(cash|money|funds)\b/i,
  /\bsick (kickflip|car|beat|trick|riff|tune|drop)\b/i,
  /\bviral video\b/i,
  /\bwent viral\b/i
];

const NEGATION_WORDS = ["no", "not", "without", "negative", "negative for", "denies", "didn't have", "did not have"];

export function anonymizeText(text) {
  return text
    .replace(/https?:\/\/\S+|www\.\S+/gi, '[URL]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL]')
    .replace(/@\w+/g, '[USER]')
    .replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE]');
}

export function classifySocialPost(rawText) {
  const clean = anonymizeText(rawText);
  const lower = clean.toLowerCase();

  // Check noise patterns
  for (const pattern of NOISE_PATTERNS) {
    if (pattern.test(lower)) {
      return {
        is_health_related: false,
        anonymized_text: clean,
        primary_category: "Noise / Filtered",
        detected_symptoms: [],
        confidence_score: 0.05,
        urgency_level: "Low",
        rejection_reason: "Idiomatic or figurative expression"
      };
    }
  }

  // Detect symptoms
  const matches = {};
  for (const [category, keywords] of Object.entries(SYMPTOM_KEYWORDS)) {
    const found = [];
    for (const kw of keywords) {
      const idx = lower.indexOf(kw);
      if (idx !== -1) {
        // Negation check in preceding 30 characters
        const preceding = lower.slice(Math.max(0, idx - 30), idx);
        const isNegated = NEGATION_WORDS.some(neg => preceding.includes(neg));
        if (!isNegated) {
          found.push(kw);
        }
      }
    }
    if (found.length > 0) {
      matches[category] = found;
    }
  }

  const detectedCategories = Object.keys(matches);
  if (detectedCategories.length === 0) {
    return {
      is_health_related: false,
      anonymized_text: clean,
      primary_category: "Non-Health",
      detected_symptoms: [],
      confidence_score: 0.1,
      urgency_level: "Low",
      rejection_reason: "No clinical symptom indicators identified"
    };
  }

  // Pick primary category with highest match count
  const primaryCat = detectedCategories.sort((a, b) => matches[b].length - matches[a].length)[0];
  const allSymptoms = Object.values(matches).flat();

  // Urgency
  let urgency = "Low";
  if (allSymptoms.includes("difficulty breathing") || allSymptoms.includes("shortness of breath") || allSymptoms.includes("temperature 103")) {
    urgency = "Critical";
  } else if (allSymptoms.length >= 2 || (allSymptoms.includes("fever") && allSymptoms.includes("cough"))) {
    urgency = "High";
  } else if (allSymptoms.length === 1) {
    urgency = "Medium";
  }

  const confidence = Math.min(0.98, Number((0.55 + allSymptoms.length * 0.12).toFixed(2)));

  return {
    is_health_related: true,
    anonymized_text: clean,
    primary_category: primaryCat,
    detected_symptoms: allSymptoms,
    confidence_score: confidence,
    urgency_level: urgency,
    rejection_reason: null
  };
}
