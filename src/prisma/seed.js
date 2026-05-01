// FUNMI BELLO Growth OS — Seed Script
// Run: npm run db:seed
// Clears and re-seeds with realistic example data for development and testing.

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n[FB-OS Seed] Clearing existing data...');
  await prisma.recommendation.deleteMany();
  await prisma.competitorSignal.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.socialComment.deleteMany();
  await prisma.lead.deleteMany();

  // ─── Competitors ──────────────────────────────────────────────────────────

  console.log('[FB-OS Seed] Creating competitors...');
  const lagosGent = await prisma.competitor.create({
    data: {
      brandName: 'Lagos Gentleman',
      instagramHandle: '@lagosgentleman',
      tiktokHandle: '@lagosgentleman',
      location: 'Lagos, Nigeria',
      niche: 'Menswear, Bespoke, Ready-to-Wear',
      notes: 'Strong Lagos presence. Heavy Instagram Reels content. Mostly bespoke and luxury native wear. Growing fast.',
    },
  });

  const abujaCouture = await prisma.competitor.create({
    data: {
      brandName: 'Abuja Couture Men',
      instagramHandle: '@abujacouture_men',
      location: 'Abuja, Nigeria',
      niche: 'Luxury native wear, Bespoke, Event styling',
      notes: 'Direct local competitor in Abuja. Targets the same premium men\'s market. Weaker online content than FB.',
    },
  });

  // ─── Competitor Signals ───────────────────────────────────────────────────

  console.log('[FB-OS Seed] Creating competitor signals...');
  await prisma.competitorSignal.createMany({
    data: [
      {
        competitorId: lagosGent.id,
        platform: 'INSTAGRAM',
        postUrl: 'https://instagram.com/p/example-lagos-1',
        caption: 'New Aso-Oke collection dropping this Friday. Limited pieces — DM to reserve yours now.',
        engagementCount: 1240,
        commentCount: 89,
        likeCount: 1151,
        signalType: 'product_launch',
        insight: 'Competitor launched limited native collection with urgency CTA. FB should counter with bespoke quality narrative to differentiate on craftsmanship, not quantity.',
      },
      {
        competitorId: lagosGent.id,
        platform: 'INSTAGRAM',
        caption: 'Outdoor lifestyle shoot — 4 looks, all bespoke, one man.',
        engagementCount: 980,
        commentCount: 55,
        likeCount: 925,
        signalType: 'content_strategy',
        insight: 'Outdoor lifestyle editorial content performing well for Lagos brands. FB should invest in Abuja location shoots — Millennium Park, National Arts Theatre area, premium hotel lobbies.',
      },
      {
        competitorId: abujaCouture.id,
        platform: 'INSTAGRAM',
        caption: 'Senator fit for the corporate man. Available for pickup in Wuse 2.',
        engagementCount: 420,
        commentCount: 31,
        likeCount: 389,
        signalType: 'local_targeting',
        insight: 'Competitor using specific Abuja location (Wuse 2) in post copy. FB should also use Abuja landmarks and neighbourhoods in content to claim local authority.',
      },
    ],
  });

  // ─── Leads ─────────────────────────────────────────────────────────────────

  console.log('[FB-OS Seed] Creating leads...');
  const leads = await prisma.lead.createMany({
    data: [
      {
        fullName: 'Emeka Obi',
        username: 'emekaobi_',
        platform: 'INSTAGRAM',
        location: 'Abuja',
        gender: 'Male',
        source: 'Instagram comment',
        interestCategory: 'BESPOKE',
        stylePreference: 'Senator, Kaftan, Luxury native',
        budgetRange: '80,000 - 200,000',
        intentLevel: 'HOT',
        leadScore: 88,
        status: 'NEW',
        notes: 'Asked about custom senator outfit for a wedding in June. Very specific about fit. High-value lead.',
      },
      {
        fullName: 'Chidi Nwosu',
        username: 'chidi.nwosu',
        platform: 'INSTAGRAM',
        location: 'Abuja',
        gender: 'Male',
        source: 'Instagram comment',
        interestCategory: 'LUXURY_NATIVE',
        stylePreference: 'Agbada, Owambe',
        intentLevel: 'HIGH',
        leadScore: 72,
        status: 'CONTACTED',
        notes: 'Wants a full agbada for an owambe in Abuja. Event date not confirmed yet.',
      },
      {
        fullName: 'Tunde Adeleke',
        username: 'tunde_style',
        platform: 'TIKTOK',
        location: 'Lagos',
        gender: 'Male',
        source: 'TikTok comment',
        interestCategory: 'URBAN_FASHION',
        stylePreference: 'Streetwear, casual drip',
        intentLevel: 'MEDIUM',
        leadScore: 42,
        status: 'NEW',
        notes: 'Commented on FB urban reel. Interested but has not asked about pricing yet.',
      },
      {
        fullName: 'Biodun Omotosho',
        username: 'biodun_omot',
        platform: 'WHATSAPP',
        phone: '+2348012345678',
        location: 'Abuja',
        gender: 'Male',
        source: 'WhatsApp inquiry',
        interestCategory: 'READY_TO_WEAR',
        budgetRange: '30,000 - 60,000',
        intentLevel: 'HIGH',
        leadScore: 78,
        status: 'INTERESTED',
        notes: 'Messaged asking for ready-to-wear catalog. Wants to pick up in Abuja. In active conversation.',
      },
      {
        fullName: 'Femi Coker',
        username: 'femicoker_ng',
        platform: 'INSTAGRAM',
        location: 'Abuja',
        gender: 'Male',
        source: 'Instagram DM',
        interestCategory: 'CAPS',
        stylePreference: 'Fitted caps, snapbacks',
        intentLevel: 'HOT',
        leadScore: 65,
        status: 'NEW',
        notes: 'Wants to order 3 custom FB caps for a photo shoot. Asked for bulk pricing.',
      },
    ],
  });

  // ─── Social Comments ──────────────────────────────────────────────────────

  console.log('[FB-OS Seed] Creating social comments...');
  await prisma.socialComment.createMany({
    data: [
      {
        platform: 'INSTAGRAM',
        postId: 'post_ig_001',
        username: 'emekaobi_',
        displayName: 'Emeka Obi',
        commentText: 'How much for a custom senator? I need one for a wedding in June. DM me',
        likeCount: 3,
        processed: true,
        classification: 'PURCHASE_READY',
        sentiment: 'POSITIVE',
        buyingIntent: 'HOT',
        fashionInterest: 'LUXURY_NATIVE',
        detectedNeed: 'EVENT_STYLING',
        suggestedReply: 'FB can style you for that occasion. What date is the event and what look are you going for — simple luxury or bold statement? DM us for a consultation.',
      },
      {
        platform: 'INSTAGRAM',
        postId: 'post_ig_002',
        username: 'bigboy_abj',
        displayName: 'BigBoy ABJ',
        commentText: 'This is clean bro. Where can I get this in Abuja?',
        likeCount: 5,
        processed: true,
        classification: 'STRONG_INTEREST',
        sentiment: 'POSITIVE',
        buyingIntent: 'HIGH',
        fashionInterest: 'URBAN_FASHION',
        detectedNeed: 'LOCATION_BASED',
        suggestedReply: 'We\'re based in Abuja and available for personal fittings. DM us to schedule a consultation at our studio.',
      },
      {
        platform: 'TIKTOK',
        postId: 'tiktok_001',
        username: 'fashionking_ng',
        displayName: 'FashionKing NG',
        commentText: 'Fire drip bro. This is the urban FB energy right here',
        likeCount: 12,
        processed: true,
        classification: 'PASSIVE_INTEREST',
        sentiment: 'POSITIVE',
        buyingIntent: 'MEDIUM',
        fashionInterest: 'URBAN_FASHION',
        detectedNeed: null,
        suggestedReply: 'Glad you love it. This and more are available at FUNMI BELLO. DM us to explore the full collection.',
      },
      {
        platform: 'INSTAGRAM',
        postId: 'post_ig_003',
        username: 'kolade_dandy',
        displayName: 'Kolade Dandy',
        commentText: 'Is this available for order? What sizes do you have? For my birthday next month',
        likeCount: 2,
        processed: true,
        classification: 'EVENT_BUYER',
        sentiment: 'POSITIVE',
        buyingIntent: 'HOT',
        fashionInterest: 'READY_TO_WEAR',
        detectedNeed: 'EVENT_STYLING',
        suggestedReply: 'FB can style you for that occasion. What date is the event and what look are you going for — simple luxury or bold statement? DM us for a consultation.',
      },
      {
        platform: 'INSTAGRAM',
        postId: 'post_ig_004',
        username: 'pricewatcher99',
        displayName: 'Price Watcher',
        commentText: 'This is nice but is it affordable? What is the price range?',
        likeCount: 1,
        processed: true,
        classification: 'STRONG_INTEREST',
        sentiment: 'POSITIVE',
        buyingIntent: 'HIGH',
        fashionInterest: 'UNKNOWN',
        detectedNeed: 'PRICE_INQUIRY',
        suggestedReply: 'We\'re glad this caught your eye. Reach out via DM for pricing, availability, and custom options. FB styles are crafted for men who know quality.',
      },
      {
        platform: 'INSTAGRAM',
        postId: 'post_ig_005',
        username: 'adekunle_fresh',
        displayName: 'Adekunle Fresh',
        commentText: 'I need bespoke agbada for my convocation. How do I place a custom order?',
        likeCount: 4,
        processed: false,
        classification: null,
        sentiment: null,
        buyingIntent: null,
        fashionInterest: null,
        detectedNeed: null,
        suggestedReply: null,
      },
    ],
  });

  // ─── Recommendations ──────────────────────────────────────────────────────

  console.log('[FB-OS Seed] Creating initial recommendations...');
  await prisma.recommendation.createMany({
    data: [
      {
        type: 'LEAD',
        title: '5 Hot Leads Waiting — Follow Up Now',
        description: 'You have 5 leads marked as HOT or HIGH intent who have not been converted yet. Reach out via WhatsApp or Instagram DM with a personalized offer. These leads are warm — don\'t let them cool.',
        priority: 10,
        source: 'hot_leads_analysis',
        status: 'PENDING',
      },
      {
        type: 'CONTENT',
        title: 'Push Event Styling Content — Multiple Leads Mentioned Events',
        description: 'Several social comments mention events, weddings, and occasions. Create a Reel titled "FB Styles You For Every Occasion" — show native, agbada, senator looks for owambe, weddings, and formal dinners. Include a clear CTA to DM for styling.',
        priority: 9,
        source: 'event_comment_analysis',
        status: 'PENDING',
      },
      {
        type: 'PRODUCT',
        title: 'Add Pricing CTA — Audience Is Asking About Prices',
        description: 'Multiple comments involve price questions. Add a "Price Guide" story highlight or a catalog post with clear price ranges. People want to know what FB costs before they commit to a DM.',
        priority: 8,
        source: 'price_inquiry_analysis',
        status: 'PENDING',
      },
      {
        type: 'COMPETITOR',
        title: 'Lagos Gentleman Is Getting Traction — Counter with Quality Narrative',
        description: 'Lagos Gentleman recently had a post with 1,240 engagements on their native collection launch. FB should counter with a bespoke craftsmanship post — show the tailoring process, fabric selection, and final fit to emphasize quality over volume.',
        priority: 7,
        source: 'competitor_signal_analysis',
        status: 'PENDING',
      },
      {
        type: 'CONTENT',
        title: 'Create Outdoor Lifestyle Content in Abuja',
        description: 'Competitor analysis shows outdoor lifestyle editorial content outperforms product-only posts. FB should invest in a Abuja location shoot — Millennium Park, Transcorp Hilton area, or Wuse 2 streets — for a premium urban editorial feel.',
        priority: 6,
        source: 'competitor_signal_analysis',
        status: 'PENDING',
      },
    ],
  });

  console.log('\n[FB-OS Seed] Done. FUNMI BELLO Growth OS database is ready.\n');
}

main()
  .catch((e) => {
    console.error('[FB-OS Seed] Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
