const { z } = require('zod');
const prisma = require('../lib/prisma');
const { success, created, notFound, badRequest, error } = require('../utils/response');
const { generate } = require('../services/recommendationEngine.service');

const statusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIONED', 'DISMISSED']),
});

const getRecommendations = async (req, res) => {
  try {
    const { status, type, page = '1', limit = '20' } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [recommendations, total] = await Promise.all([
      prisma.recommendation.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.recommendation.count({ where }),
    ]);

    return success(res, { recommendations, total, page: pageNum, limit: limitNum });
  } catch (err) {
    return error(res, 'Failed to fetch recommendations', 500);
  }
};

const generateRecommendations = async (req, res) => {
  try {
    const generated = await generate();

    if (generated.length === 0) {
      return success(res, { generated: 0, recommendations: [] }, 'No new recommendations needed at this time. Data signals are insufficient.');
    }

    await prisma.recommendation.createMany({ data: generated });

    const fresh = await prisma.recommendation.findMany({
      where: { status: 'PENDING' },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return success(
      res,
      { generated: generated.length, recommendations: fresh },
      `${generated.length} recommendations generated for FUNMI BELLO`
    );
  } catch (err) {
    console.error('[FB-OS] generateRecommendations error:', err);
    return error(res, 'Failed to generate recommendations', 500);
  }
};

const updateRecommendationStatus = async (req, res) => {
  try {
    const rec = await prisma.recommendation.findUnique({ where: { id: req.params.id } });
    if (!rec) return notFound(res, 'Recommendation not found');

    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, 'Validation failed', parsed.error.flatten().fieldErrors);
    }

    const updated = await prisma.recommendation.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });

    return success(res, updated, `Recommendation marked as ${parsed.data.status.toLowerCase()}`);
  } catch (err) {
    return error(res, 'Failed to update recommendation status', 500);
  }
};

module.exports = { getRecommendations, generateRecommendations, updateRecommendationStatus };
