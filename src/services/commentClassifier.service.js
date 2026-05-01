// Comment Classifier Service — FUNMI BELLO Growth OS
// Rule-based classification. No paid AI API required for Phase 1.
// Detects buying intent, fashion interest, urgency, location, and VIP signals
// from raw social media comment text.

// ─── Intent Keyword Banks ──────────────────────────────────────────────────────

const HOT_INTENT_KEYWORDS = [
  'how much', 'price', 'cost', 'how to order', 'can i order', 'i want this',
  'i need this', 'take my money', 'i\'m interested', 'i am interested',
  'drop the link', 'send me the link', 'dm me', 'dm sent', 'send your details',
  'available', 'in stock', 'order now', 'i want to buy', 'where can i get',
  'where to buy', 'how do i get', 'send account', 'account number',
  'can you make one', 'make this for me', 'custom order', 'size available',
  'my size', 'whatsapp number', 'contact', 'phone number', 'place an order',
  'how to place', 'i\'d like to order', 'i would like to order',
];

const HIGH_INTENT_KEYWORDS = [
  'how soon', 'delivery', 'shipping', 'do you ship', 'what colors',
  'color options', 'which colors', 'sizes', 'measurements', 'fitting',
  'consultation', 'for my event', 'for the occasion', 'for the wedding',
  'for my birthday', 'collection', 'catalog', 'full look', 'complete outfit',
  'i\'d love', 'i would love', 'interested', 'want this', 'need this',
  'abuja', 'lagos', 'ph', 'enugu', 'kano', 'ibadan', 'location', 'near me',
];

const MEDIUM_INTENT_KEYWORDS = [
  'nice', 'love this', 'fire', 'this is clean', 'clean', 'this is it',
  'beautiful', 'looking good', 'amazing', 'gorgeous', 'stunning', 'wow',
  'this is hard', 'sharp', 'dapper', 'fresh', 'lit', 'killing it',
  'goals', 'fashion goals', 'motivation', 'god when', 'when e be my turn',
  'blessed', 'slay', 'drip', 'hard', 'this guy', 'respect',
];

// ─── Fashion Category Keywords ─────────────────────────────────────────────────

const FASHION_CATEGORIES = {
  BESPOKE: [
    'bespoke', 'custom', 'tailor made', 'tailored', 'made to measure',
    'custom sewn', 'custom fit', 'personal fitting', 'custom made', 'tailor',
    'hand sewn', 'fitted specifically',
  ],
  LUXURY_NATIVE: [
    'agbada', 'senator', 'kaftan', 'native', 'traditional', 'ankara',
    'aso oke', 'babariga', 'fila', 'buba', 'sokoto', 'danshiki',
    'regalia', 'yoruba', 'igbo', 'hausa', 'traditional attire', 'owambe',
    'aso-ebi', 'native wear', 'full native',
  ],
  READY_TO_WEAR: [
    'ready made', 'ready to wear', 'off the rack', 'available size',
    'pick up', 'in-stock', 'available now', 'ready',
  ],
  URBAN_FASHION: [
    'streetwear', 'urban', 'street style', 'drip', 'hypebeast',
    'sneakers', 'joggers', 'hoodie', 'bomber', 'tracksuit',
    'oversized', 'everyday', 'daily wear',
  ],
  CAPS: [
    'cap', 'caps', 'hat', 'snapback', 'fitted cap', 'bucket hat',
    'headwear', 'baseball cap', 'kufi', 'cap collection',
  ],
  ACCESSORIES: [
    'belt', 'shoes', 'bag', 'watch', 'bracelet', 'necklace', 'ring',
    'sunglasses', 'wallet', 'pocket square', 'tie', 'cufflinks',
    'accessories', 'accessory', 'chain', 'wristwatch',
  ],
  CASUAL_WEAR: [
    'casual', 't-shirt', 'polo', 'shorts', 'jeans', 'chinos',
    'loafers', 'weekend', 'laid back', 'simple', 'plain', 'relaxed',
  ],
};

// ─── Occasion / Event Keywords ────────────────────────────────────────────────

const OCCASION_KEYWORDS = [
  'wedding', 'event', 'party', 'dinner', 'date', 'birthday', 'owambe',
  'ceremony', 'graduation', 'convocation', 'gala', 'photoshoot',
  'thanksgiving', 'church', 'mosque', 'outing', 'hangout', 'anniversary',
  'naming ceremony', 'burial', 'coronation',
];

// ─── VIP Signals ──────────────────────────────────────────────────────────────

const VIP_SIGNALS = [
  'top notch', 'luxury', 'premium', 'vip', 'exclusive', 'high end',
  'nothing but the best', 'quality over everything', 'money no be problem',
  'budget is not an issue', 'let\'s talk price', 'i can afford',
  'price no dey matter',
];

// ─── Price Sensitivity Keywords ───────────────────────────────────────────────

const PRICE_SENSITIVE_KEYWORDS = [
  'affordable', 'cheap', 'budget', 'not too expensive', 'reasonable',
  'discount', 'promo', 'sale', 'offer', 'deal', 'how much exactly',
  'small price', 'price range', 'student', 'low budget',
];

// ─── Location Keywords ────────────────────────────────────────────────────────

const LOCATION_KEYWORDS = [
  'abuja', 'lagos', 'kano', 'ph', 'port harcourt', 'enugu', 'ibadan',
  'kaduna', 'benin', 'onitsha', 'warri', 'owerri', 'abeokuta', 'akure',
  'delta', 'anambra', 'rivers', 'lekki', 'vi', 'surulere', 'ikoyi',
  'maitama', 'wuse', 'garki', 'asokoro', 'gwarimpa', 'jabi', 'lugbe',
];

// ─── FB-Voice Reply Templates ─────────────────────────────────────────────────
// Replies sound personal, premium, and confident — the FUNMI BELLO voice.

const REPLIES = {
  HOT_BESPOKE:
    'Thank you for your interest. This piece can be made to fit your exact style and size. Would you prefer bespoke tailoring or ready-to-wear? DM us and let\'s create something built just for you.',
  HOT_LUXURY_NATIVE:
    'FB can style you for that occasion. What date is the event and what look are you going for — simple luxury or bold statement? DM us for a personal consultation.',
  HOT_READY_TO_WEAR:
    'This is available in selected sizes. Would you like the catalog or a direct fitting consultation? Send us a DM and let\'s sort you out.',
  HOT_CAPS:
    'Our caps collection is fire right now. DM us for the full lineup and sizing options — we\'ll find the perfect fit for your head and your vibe.',
  HOT_ACCESSORIES:
    'Our accessories are handpicked to elevate any look. DM us for the current collection and let\'s complete your style.',
  HOT_URBAN:
    'That\'s the urban FB energy right there. DM us for sizing, pricing, and availability — let\'s style you properly.',
  HOT_DEFAULT:
    'Thank you for your interest in FUNMI BELLO. DM us and let\'s talk style — we\'ll find exactly what you need.',
  HIGH_DEFAULT:
    'We\'re glad this caught your eye. Reach out via DM for pricing, availability, and custom options. FB styles are crafted for men who know quality.',
  MEDIUM_BESPOKE:
    'FB bespoke is for the man who wants his clothes to speak for him. DM us to start your style journey.',
  MEDIUM_DEFAULT:
    'Glad you love it. This and more are available at FUNMI BELLO. DM us to explore the full collection.',
  WEDDING_EVENT:
    'FB can style you for that event perfectly. Whether it\'s a full bespoke look or a ready-to-wear statement piece — DM us and let\'s talk. What\'s the date?',
  LOCATION_ABUJA:
    'We\'re based in Abuja and available for personal fittings. DM us to schedule a consultation at our studio.',
  VIP_SIGNAL:
    'We appreciate your taste. FUNMI BELLO offers exclusive bespoke consultations for discerning clients. DM us and let\'s create something truly personal.',
};

// ─── Core Classifier ──────────────────────────────────────────────────────────

const classify = (commentText) => {
  if (!commentText || typeof commentText !== 'string') {
    return buildResult('GENERAL', 'NEUTRAL', 'LOW', 'UNKNOWN', null, REPLIES.MEDIUM_DEFAULT);
  }

  const text = commentText.toLowerCase().trim();

  // ── Buying intent ──
  const isHot = HOT_INTENT_KEYWORDS.some((kw) => text.includes(kw));
  const isHigh = HIGH_INTENT_KEYWORDS.some((kw) => text.includes(kw));
  const isMedium = MEDIUM_INTENT_KEYWORDS.some((kw) => text.includes(kw));

  let buyingIntent = 'LOW';
  if (isHot) buyingIntent = 'HOT';
  else if (isHigh) buyingIntent = 'HIGH';
  else if (isMedium) buyingIntent = 'MEDIUM';

  // ── Fashion interest ──
  let fashionInterest = 'UNKNOWN';
  for (const [category, keywords] of Object.entries(FASHION_CATEGORIES)) {
    if (keywords.some((kw) => text.includes(kw))) {
      fashionInterest = category;
      break;
    }
  }

  // ── Special signals ──
  const isOccasion = OCCASION_KEYWORDS.some((kw) => text.includes(kw));
  const isVIP = VIP_SIGNALS.some((kw) => text.includes(kw));
  const isPriceSensitive = PRICE_SENSITIVE_KEYWORDS.some((kw) => text.includes(kw));
  const isAbuja = text.includes('abuja');

  // ── Detected need ──
  let detectedNeed = null;
  if (isVIP) detectedNeed = 'VIP_CUSTOMER';
  else if (isOccasion) detectedNeed = 'EVENT_STYLING';
  else if (isPriceSensitive) detectedNeed = 'PRICE_INQUIRY';
  else if (isAbuja || LOCATION_KEYWORDS.some((kw) => text.includes(kw))) detectedNeed = 'LOCATION_BASED';
  else if (buyingIntent === 'HOT') detectedNeed = 'DIRECT_PURCHASE';
  else if (buyingIntent === 'HIGH') detectedNeed = 'STRONG_INTEREST';

  // ── Sentiment ──
  const sentiment = (isHot || isHigh || isMedium || isVIP) ? 'POSITIVE' : 'NEUTRAL';

  // ── Classification label ──
  let classification = 'GENERAL_INTEREST';
  if (isVIP) classification = 'VIP_SIGNAL';
  else if (isHot && isOccasion) classification = 'EVENT_BUYER';
  else if (isHot) classification = 'PURCHASE_READY';
  else if (isHigh) classification = 'STRONG_INTEREST';
  else if (isMedium) classification = 'PASSIVE_INTEREST';

  // ── Suggested reply ──
  const suggestedReply = selectReply(buyingIntent, fashionInterest, isOccasion, isAbuja, isVIP);

  return buildResult(classification, sentiment, buyingIntent, fashionInterest, detectedNeed, suggestedReply);
};

const selectReply = (intent, fashionInterest, isOccasion, isAbuja, isVIP) => {
  if (isVIP) return REPLIES.VIP_SIGNAL;
  if (isOccasion) return REPLIES.WEDDING_EVENT;
  if (isAbuja) return REPLIES.LOCATION_ABUJA;

  if (intent === 'HOT') {
    const map = {
      BESPOKE: REPLIES.HOT_BESPOKE,
      LUXURY_NATIVE: REPLIES.HOT_LUXURY_NATIVE,
      READY_TO_WEAR: REPLIES.HOT_READY_TO_WEAR,
      CAPS: REPLIES.HOT_CAPS,
      ACCESSORIES: REPLIES.HOT_ACCESSORIES,
      URBAN_FASHION: REPLIES.HOT_URBAN,
    };
    return map[fashionInterest] || REPLIES.HOT_DEFAULT;
  }

  if (intent === 'HIGH') return REPLIES.HIGH_DEFAULT;
  if (fashionInterest === 'BESPOKE') return REPLIES.MEDIUM_BESPOKE;
  return REPLIES.MEDIUM_DEFAULT;
};

const buildResult = (classification, sentiment, buyingIntent, fashionInterest, detectedNeed, suggestedReply) => ({
  classification,
  sentiment,
  buyingIntent,
  fashionInterest,
  detectedNeed,
  suggestedReply,
});

module.exports = { classify };
