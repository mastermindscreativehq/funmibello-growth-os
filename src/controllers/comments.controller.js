const { z } = require('zod');
const prisma = require('../lib/prisma');
const { success, created, notFound, badRequest, error } = require('../utils/response');
const { handlePrismaError } = require('../utils/errors');
const { classify } = require('../services/commentClassifier.service');
const { computeScore } = require('../services/leadScoring.service');

const PLATFORMS = ['INSTAGRAM', 'TIKTOK', 'TWITTER', 'FACEBOOK', 'WHATSAPP', 'TELEGRAM', 'MANUAL'];

const ingestSchema = z.object({
  platform: z.enum(PLATFORMS),
  postUrl: z.string().url().optional().or(z.literal('')),
  postId: z.string().optional(),
  commentId: z.string().optional(),
  username: z.string().optional(),
  displayName: z.string().optional(),
  profileUrl: z.string().url().optional().or(z.literal('')),
  commentText: z.string().min(1, 'Comment text is required'),
  likeCount: z.number().int().min(0).default(0),
  publishedAt: z.string().datetime().optional(),
  rawPayload: z.record(z.any()).optional(),
});

const ingestComment = async (req, res) => {
  try {
    const parsed = ingestSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, 'Validation failed', parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;
    const result = classify(data.commentText);

    const comment = await prisma.socialComment.create({
      data: {
        platform: data.platform,
        postUrl: data.postUrl || null,
        postId: data.postId || null,
        commentId: data.commentId || null,
        username: data.username || null,
        displayName: data.displayName || null,
        profileUrl: data.profileUrl || null,
        commentText: data.commentText,
        likeCount: data.likeCount,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        rawPayload: data.rawPayload || null,
        processed: true,
        classification: result.classification,
        sentiment: result.sentiment,
        buyingIntent: result.buyingIntent,
        fashionInterest: result.fashionInterest,
        detectedNeed: result.detectedNeed,
        suggestedReply: result.suggestedReply,
      },
    });

    // Auto-create or link a lead when intent is HIGH or HOT
    let lead = null;
    let autoLinked = false;

    if (['HIGH', 'HOT'].includes(result.buyingIntent) && data.username) {
      lead = await prisma.lead.findFirst({
        where: { username: data.username, platform: data.platform },
      });

      if (!lead) {
        const scoreData = {
          intentLevel: result.buyingIntent,
          interestCategory: result.fashionInterest || 'UNKNOWN',
          platform: data.platform,
        };

        lead = await prisma.lead.create({
          data: {
            username: data.username,
            platform: data.platform,
            source: `${data.platform}_COMMENT_INGEST`,
            intentLevel: result.buyingIntent,
            interestCategory: result.fashionInterest || 'UNKNOWN',
            leadScore: computeScore(scoreData),
            status: 'NEW',
            notes: `Auto-created from ${data.platform} comment: "${data.commentText.substring(0, 120)}"`,
          },
        });
      }

      await prisma.socialComment.update({
        where: { id: comment.id },
        data: { leadId: lead.id },
      });

      autoLinked = true;
    }

    return created(
      res,
      { comment: { ...comment, leadId: lead?.id || null }, lead, autoLinked, classification: result },
      autoLinked
        ? `Comment ingested and ${lead ? 'linked to existing lead' : 'new lead auto-created'}`
        : 'Comment ingested and classified'
    );
  } catch (err) {
    console.error('[FB-OS] ingestComment error:', err);
    const appErr = handlePrismaError(err);
    return error(res, appErr.message, appErr.statusCode);
  }
};

const getComments = async (req, res) => {
  try {
    const { platform, processed, buyingIntent, fashionInterest, page = '1', limit = '20' } = req.query;

    const where = {};
    if (platform) where.platform = platform;
    if (processed !== undefined) where.processed = processed === 'true';
    if (buyingIntent) where.buyingIntent = buyingIntent;
    if (fashionInterest) where.fashionInterest = fashionInterest;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [comments, total] = await Promise.all([
      prisma.socialComment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { lead: { select: { id: true, username: true, status: true, leadScore: true } } },
      }),
      prisma.socialComment.count({ where }),
    ]);

    return success(res, { comments, total, page: pageNum, limit: limitNum });
  } catch (err) {
    return error(res, 'Failed to fetch comments', 500);
  }
};

const getUnprocessedComments = async (req, res) => {
  try {
    const comments = await prisma.socialComment.findMany({
      where: { processed: false },
      orderBy: { createdAt: 'asc' },
    });

    return success(res, { comments, count: comments.length }, `${comments.length} unprocessed comment(s) found`);
  } catch (err) {
    return error(res, 'Failed to fetch unprocessed comments', 500);
  }
};

const classifyComment = async (req, res) => {
  try {
    const comment = await prisma.socialComment.findUnique({ where: { id: req.params.id } });
    if (!comment) return notFound(res, 'Comment not found');

    const result = classify(comment.commentText);

    const updated = await prisma.socialComment.update({
      where: { id: req.params.id },
      data: {
        processed: true,
        classification: result.classification,
        sentiment: result.sentiment,
        buyingIntent: result.buyingIntent,
        fashionInterest: result.fashionInterest,
        detectedNeed: result.detectedNeed,
        suggestedReply: result.suggestedReply,
      },
    });

    return success(res, { comment: updated, classification: result }, 'Comment classified successfully');
  } catch (err) {
    return error(res, 'Failed to classify comment', 500);
  }
};

module.exports = { ingestComment, getComments, getUnprocessedComments, classifyComment };
