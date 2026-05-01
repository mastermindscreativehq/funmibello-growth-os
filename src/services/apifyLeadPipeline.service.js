// Apify Lead Pipeline Service — FUNMI BELLO Growth OS
// Receives scraped Instagram/TikTok comment arrays from Apify,
// classifies each comment, saves to social_comments, and auto-creates
// leads in the leads table when buying intent is HOT or HIGH.

const prisma = require('../lib/prisma');
const { classify } = require('./commentClassifier.service');

// Lead score assigned based on intent level
const LEAD_SCORE_MAP = {
  HOT: 90,
  HIGH: 75,
  MEDIUM: 45,
  LOW: 15,
};

// ─── Main Pipeline Function ───────────────────────────────────────────────────

const processComments = async (comments) => {
  const results = [];
  let leadsCreated = 0;
  let leadsLinked = 0;
  let commentsSaved = 0;

  for (const item of comments) {
    const {
      platform,
      username,
      displayName,
      profileUrl,
      commentText,
      postUrl,
      likeCount = 0,
      publishedAt,
      rawPayload,
    } = item;

    // Step 1: Run the comment through the classifier
    const classificationResult = classify(commentText);
    const {
      classification,
      sentiment,
      buyingIntent,
      fashionInterest,
      detectedNeed,
      suggestedReply,
    } = classificationResult;

    // Step 2: Save the comment to social_comments
    const savedComment = await prisma.socialComment.create({
      data: {
        platform,
        username: username || null,
        displayName: displayName || null,
        profileUrl: profileUrl || null,
        commentText,
        postUrl: postUrl || null,
        likeCount: Number(likeCount) || 0,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        rawPayload: rawPayload || {},
        processed: true,
        classification,
        sentiment,
        buyingIntent,
        fashionInterest: fashionInterest || null,
        detectedNeed: detectedNeed || null,
        suggestedReply,
      },
    });

    commentsSaved++;

    // Step 3: If HOT or HIGH intent, create or link a lead
    let leadId = null;
    let leadAction = 'none';

    if (buyingIntent === 'HOT' || buyingIntent === 'HIGH') {
      // Check if a lead already exists for this username + platform
      let existingLead = null;
      if (username) {
        existingLead = await prisma.lead.findFirst({
          where: { username, platform },
        });
      }

      if (existingLead) {
        // Link comment to existing lead
        leadId = existingLead.id;
        leadAction = 'linked_existing';
        leadsLinked++;
      } else {
        // Create a new lead from the comment data
        const newLead = await prisma.lead.create({
          data: {
            fullName: displayName || username || null,
            username: username || null,
            platform,
            source: 'apify_comment',
            interestCategory: fashionInterest || 'UNKNOWN',
            stylePreference: detectedNeed || commentText.substring(0, 120),
            intentLevel: buyingIntent,
            leadScore: LEAD_SCORE_MAP[buyingIntent],
            status: 'NEW',
            notes: `${commentText}\n\nPost: ${postUrl || ''}`.trim(),
          },
        });

        leadId = newLead.id;
        leadAction = 'created_new';
        leadsCreated++;
      }

      // Link the saved comment to the lead
      await prisma.socialComment.update({
        where: { id: savedComment.id },
        data: { leadId },
      });
    }

    results.push({
      commentId: savedComment.id,
      username: username || null,
      commentText: commentText.substring(0, 80),
      buyingIntent,
      fashionInterest: fashionInterest || 'UNKNOWN',
      leadAction,
      leadId,
      suggestedReply,
    });
  }

  return {
    totalReceived: comments.length,
    commentsSaved,
    leadsCreated,
    leadsLinked,
    results,
  };
};

module.exports = { processComments };
