// Recommendation Engine — FUNMI BELLO Growth OS
// Analyses leads, comments, and competitor signals to generate actionable
// intelligence for FUNMI BELLO's content, sales, and brand strategy.

const prisma = require('../lib/prisma');

const generate = async () => {
  const recommendations = [];

  // ─── 1. Hot Lead Follow-up ─────────────────────────────────────────────────
  const hotLeads = await prisma.lead.findMany({
    where: { intentLevel: { in: ['HOT', 'HIGH'] }, status: { in: ['NEW', 'QUALIFIED'] } },
  });

  if (hotLeads.length >= 1) {
    recommendations.push({
      type: 'LEAD',
      title: `${hotLeads.length} Hot Lead${hotLeads.length > 1 ? 's' : ''} Waiting — Follow Up Now`,
      description: `You have ${hotLeads.length} lead${hotLeads.length > 1 ? 's' : ''} marked as HOT or HIGH intent who ${hotLeads.length > 1 ? 'have' : 'has'} not been converted yet. Reach out via WhatsApp or Instagram DM with a personalized offer. These leads are warm — don't let them cool.`,
      priority: 10,
      source: 'hot_leads_analysis',
    });
  }

  // ─── 2. Event / Occasion Demand ───────────────────────────────────────────
  const eventComments = await prisma.socialComment.count({
    where: { detectedNeed: 'EVENT_STYLING' },
  });
  const eventLeads = await prisma.lead.count({
    where: { notes: { contains: 'event', mode: 'insensitive' } },
  });

  if (eventComments + eventLeads >= 2) {
    recommendations.push({
      type: 'CONTENT',
      title: 'Push Event Styling Content — Multiple Signals Around Events',
      description: `${eventComments + eventLeads} event-related signals detected across leads and comments. Create a Reel titled "FB Styles You For Every Occasion" — show native, agbada, and senator looks for owambe, weddings, and formal dinners. End with a clear DM CTA. Weddings and owambes are high-value orders.`,
      priority: 9,
      source: 'event_demand_analysis',
    });
  }

  // ─── 3. Pricing Friction ──────────────────────────────────────────────────
  const priceComments = await prisma.socialComment.count({
    where: { detectedNeed: 'PRICE_INQUIRY' },
  });

  if (priceComments >= 1) {
    recommendations.push({
      type: 'PRODUCT',
      title: 'Reduce Pricing Friction — Audience Is Asking About Prices',
      description: `${priceComments} comment${priceComments > 1 ? 's' : ''} involve price questions. Add a "Price Guide" story highlight or a catalog post with clear price ranges. People want to know what FB costs before they commit to a DM — removing that friction will increase conversions.`,
      priority: 8,
      source: 'price_friction_analysis',
    });
  }

  // ─── 4. Bespoke Demand ────────────────────────────────────────────────────
  const bespokeLeads = await prisma.lead.count({
    where: { interestCategory: 'BESPOKE' },
  });
  const bespokeComments = await prisma.socialComment.count({
    where: { fashionInterest: 'BESPOKE' },
  });

  if (bespokeLeads + bespokeComments >= 1) {
    recommendations.push({
      type: 'SALES',
      title: 'Promote FB Bespoke Service — Demand Signals Are Clear',
      description: `${bespokeLeads + bespokeComments} bespoke interest signal${bespokeLeads + bespokeComments > 1 ? 's' : ''} detected. Create a dedicated bespoke enquiry funnel: a WhatsApp link in bio, a post explaining the process (consultation → fabric → fitting → delivery), and a short video showing a custom piece from fabric to finish. Bespoke is FB's highest-margin service.`,
      priority: 8,
      source: 'bespoke_demand_analysis',
    });
  }

  // ─── 5. Competitor Intelligence ───────────────────────────────────────────
  const topSignal = await prisma.competitorSignal.findFirst({
    orderBy: { engagementCount: 'desc' },
    include: { competitor: true },
  });

  if (topSignal) {
    recommendations.push({
      type: 'COMPETITOR',
      title: `Competitor Intel: ${topSignal.competitor.brandName} Is Getting Traction`,
      description: `${topSignal.competitor.brandName} had a post with ${topSignal.engagementCount.toLocaleString()} engagements. Signal type: ${topSignal.signalType || 'unknown'}. Insight: "${topSignal.insight || topSignal.caption?.substring(0, 100) || 'No caption logged'}". Study their approach and create FB content that demonstrates superior quality and craftsmanship in a similar format.`,
      priority: 7,
      source: 'competitor_signal_analysis',
    });
  }

  // ─── 6. Urban Fashion Content Gap ────────────────────────────────────────
  const urbanLeads = await prisma.lead.count({ where: { interestCategory: 'URBAN_FASHION' } });
  const urbanComments = await prisma.socialComment.count({ where: { fashionInterest: 'URBAN_FASHION' } });

  if (urbanLeads + urbanComments >= 2) {
    recommendations.push({
      type: 'CONTENT',
      title: 'Create Urban Fashion Content — Audience Interest Is Building',
      description: `${urbanLeads + urbanComments} urban/streetwear interest signals detected. Create a Reel showing 3 ways to wear FB urban pieces — street casual, smart casual, and event-ready. Shoot at lifestyle locations in Abuja for visual impact. Urban content performs well on TikTok and targets a younger, aspirational buyer.`,
      priority: 6,
      source: 'urban_interest_analysis',
    });
  }

  // ─── 7. Accessories & Caps Upsell ────────────────────────────────────────
  const accessorySignals = await prisma.socialComment.count({
    where: { fashionInterest: { in: ['CAPS', 'ACCESSORIES'] } },
  });
  const accessoryLeads = await prisma.lead.count({
    where: { interestCategory: { in: ['CAPS', 'ACCESSORIES'] } },
  });

  if (accessorySignals + accessoryLeads >= 1) {
    recommendations.push({
      type: 'PRODUCT',
      title: 'Feature Caps & Accessories — Easy Win for Revenue',
      description: `${accessorySignals + accessoryLeads} cap and accessory interest signal${accessorySignals + accessoryLeads > 1 ? 's' : ''} detected. Create a dedicated accessories post or story series. Bundle them with outfit suggestions — "The Complete FB Look". Accessories are high-margin, easy to ship, and a low-friction purchase for new customers.`,
      priority: 6,
      source: 'accessories_interest_analysis',
    });
  }

  // ─── 8. Outdoor / Location Content ───────────────────────────────────────
  const locationComments = await prisma.socialComment.count({
    where: { detectedNeed: 'LOCATION_BASED' },
  });

  if (locationComments >= 2) {
    recommendations.push({
      type: 'CONTENT',
      title: 'Shoot Outdoor Lifestyle Content in Abuja',
      description: `${locationComments} location-based inquiries detected. Competitor analysis also confirms outdoor lifestyle content outperforms studio shots. Invest in an Abuja location shoot — Millennium Park, Transcorp Hilton area, or Wuse 2 streets — to create premium editorial content that signals local authority and premium taste.`,
      priority: 5,
      source: 'location_content_analysis',
    });
  }

  // ─── 9. Unprocessed Comment Backlog ──────────────────────────────────────
  const unprocessed = await prisma.socialComment.count({ where: { processed: false } });

  if (unprocessed > 0) {
    recommendations.push({
      type: 'LEAD',
      title: `${unprocessed} Unclassified Comment${unprocessed > 1 ? 's' : ''} Need Review`,
      description: `There ${unprocessed > 1 ? 'are' : 'is'} ${unprocessed} social comment${unprocessed > 1 ? 's' : ''} that ${unprocessed > 1 ? 'have' : 'has'} not been classified yet. Use POST /api/comments/:id/classify or re-ingest them. Unclassified comments may contain hidden buying signals that turn into real leads.`,
      priority: 5,
      source: 'unprocessed_comment_check',
    });
  }

  // ─── 10. Brand Milestone — Reinforce Premium Positioning ─────────────────
  const totalLeads = await prisma.lead.count();

  if (totalLeads >= 10) {
    recommendations.push({
      type: 'BRAND_POSITIONING',
      title: 'FB Has Real Traction — Reinforce Premium Positioning',
      description: `With ${totalLeads} leads in the system, FUNMI BELLO has built a real audience. Now is the time to reinforce premium brand positioning. Post a behind-the-scenes tailoring video, a client transformation story, or a "what makes FB different" post to convert followers into believers and buyers into loyal clients.`,
      priority: 4,
      source: 'lead_milestone_analysis',
    });
  }

  if (recommendations.length === 0) return [];

  // Refresh stale PENDING recommendations so analysis stays current.
  const sources = [...new Set(recommendations.map((r) => r.source))];
  await prisma.recommendation.deleteMany({
    where: { source: { in: sources }, status: 'PENDING' },
  });

  return recommendations;
};

module.exports = { generate };
