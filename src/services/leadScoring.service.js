// Lead Scoring Service — FUNMI BELLO Growth OS
// Produces a 0–100 score based on intent, fashion category, platform, and profile completeness.

const INTENT_SCORES = {
  HOT: 40,
  HIGH: 28,
  MEDIUM: 14,
  LOW: 4,
};

const CATEGORY_SCORES = {
  BESPOKE: 20,
  LUXURY_NATIVE: 18,
  READY_TO_WEAR: 14,
  URBAN_FASHION: 11,
  CASUAL_WEAR: 9,
  CAPS: 7,
  ACCESSORIES: 7,
  UNKNOWN: 0,
};

const PLATFORM_SCORES = {
  WHATSAPP: 15,
  TELEGRAM: 12,
  INSTAGRAM: 10,
  TIKTOK: 8,
  FACEBOOK: 6,
  TWITTER: 5,
  MANUAL: 8,
};

const computeScore = (data = {}) => {
  let score = 0;

  score += INTENT_SCORES[data.intentLevel] || 0;
  score += CATEGORY_SCORES[data.interestCategory] || 0;
  score += PLATFORM_SCORES[data.platform] || 0;

  // Profile completeness bonuses
  if (data.phone) score += 8;
  if (data.email) score += 5;
  if (data.location) score += 4;
  if (data.fullName) score += 3;
  if (data.budgetRange) score += 5;

  return Math.min(score, 100);
};

// Derive an IntentLevel from a raw lead score (used when re-evaluating leads).
const deriveIntentFromScore = (score) => {
  if (score >= 70) return 'HOT';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
};

module.exports = { computeScore, deriveIntentFromScore };
