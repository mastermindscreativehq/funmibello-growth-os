const { z } = require('zod');
const prisma = require('../lib/prisma');
const { success, created, notFound, badRequest, error } = require('../utils/response');
const { handlePrismaError } = require('../utils/errors');

const PLATFORMS = ['INSTAGRAM', 'TIKTOK', 'TWITTER', 'FACEBOOK', 'WHATSAPP', 'TELEGRAM', 'MANUAL'];

const competitorSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required'),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  location: z.string().optional(),
  niche: z.string().optional(),
  notes: z.string().optional(),
});

const signalSchema = z.object({
  platform: z.enum(PLATFORMS),
  postUrl: z.string().url().optional().or(z.literal('')),
  caption: z.string().optional(),
  engagementCount: z.number().int().min(0).default(0),
  commentCount: z.number().int().min(0).default(0),
  likeCount: z.number().int().min(0).default(0),
  signalType: z.string().optional(),
  insight: z.string().optional(),
});

const createCompetitor = async (req, res) => {
  try {
    const parsed = competitorSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, 'Validation failed', parsed.error.flatten().fieldErrors);
    }

    const competitor = await prisma.competitor.create({ data: parsed.data });
    return created(res, competitor, `${competitor.brandName} added to competitor tracking`);
  } catch (err) {
    const appErr = handlePrismaError(err);
    return error(res, appErr.message, appErr.statusCode);
  }
};

const getCompetitors = async (req, res) => {
  try {
    const competitors = await prisma.competitor.findMany({
      include: {
        _count: { select: { signals: true } },
        signals: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return success(res, competitors);
  } catch (err) {
    return error(res, 'Failed to fetch competitors', 500);
  }
};

const addCompetitorSignal = async (req, res) => {
  try {
    const competitor = await prisma.competitor.findUnique({ where: { id: req.params.id } });
    if (!competitor) return notFound(res, 'Competitor not found');

    const parsed = signalSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, 'Validation failed', parsed.error.flatten().fieldErrors);
    }

    const signal = await prisma.competitorSignal.create({
      data: { ...parsed.data, competitorId: req.params.id },
    });

    return created(res, signal, `Signal logged for ${competitor.brandName}`);
  } catch (err) {
    const appErr = handlePrismaError(err);
    return error(res, appErr.message, appErr.statusCode);
  }
};

const getCompetitorSignals = async (req, res) => {
  try {
    const competitor = await prisma.competitor.findUnique({ where: { id: req.params.id } });
    if (!competitor) return notFound(res, 'Competitor not found');

    const signals = await prisma.competitorSignal.findMany({
      where: { competitorId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });

    return success(res, { competitor: competitor.brandName, signalCount: signals.length, signals });
  } catch (err) {
    return error(res, 'Failed to fetch competitor signals', 500);
  }
};

module.exports = { createCompetitor, getCompetitors, addCompetitorSignal, getCompetitorSignals };
