const { z } = require('zod');
const prisma = require('../lib/prisma');
const { success, created, notFound, badRequest, error } = require('../utils/response');
const { handlePrismaError } = require('../utils/errors');
const { computeScore } = require('../services/leadScoring.service');

const PLATFORMS = ['INSTAGRAM', 'TIKTOK', 'TWITTER', 'FACEBOOK', 'WHATSAPP', 'TELEGRAM', 'MANUAL'];
const INTENT_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'HOT'];
const INTEREST_CATEGORIES = ['BESPOKE', 'READY_TO_WEAR', 'CAPS', 'ACCESSORIES', 'URBAN_FASHION', 'LUXURY_NATIVE', 'CASUAL_WEAR', 'UNKNOWN'];
const STATUSES = ['NEW', 'QUALIFIED', 'CONTACTED', 'INTERESTED', 'CONVERTED', 'LOST'];

const leadSchema = z.object({
  fullName: z.string().optional(),
  username: z.string().optional(),
  platform: z.enum(PLATFORMS).optional(),
  platformUserId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  location: z.string().optional(),
  gender: z.string().optional(),
  source: z.string().optional(),
  interestCategory: z.enum(INTEREST_CATEGORIES).optional(),
  stylePreference: z.string().optional(),
  budgetRange: z.string().optional(),
  intentLevel: z.enum(INTENT_LEVELS).optional(),
  status: z.enum(STATUSES).optional(),
  lastContactedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const createLead = async (req, res) => {
  try {
    const parsed = leadSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, 'Validation failed', parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;
    const leadScore = computeScore(data);

    const lead = await prisma.lead.create({ data: { ...data, leadScore } });
    return created(res, lead, 'Lead created successfully');
  } catch (err) {
    const appErr = handlePrismaError(err);
    return error(res, appErr.message, appErr.statusCode);
  }
};

const getLeads = async (req, res) => {
  try {
    const {
      status, intentLevel, interestCategory, platform,
      page = '1', limit = '20', search,
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (intentLevel) where.intentLevel = intentLevel;
    if (interestCategory) where.interestCategory = interestCategory;
    if (platform) where.platform = platform;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { leadScore: 'desc' },
      }),
      prisma.lead.count({ where }),
    ]);

    return success(res, { leads, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    return error(res, 'Failed to fetch leads', 500);
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!lead) return notFound(res, 'Lead not found');
    return success(res, lead);
  } catch (err) {
    return error(res, 'Failed to fetch lead', 500);
  }
};

const updateLead = async (req, res) => {
  try {
    const parsed = leadSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, 'Validation failed', parsed.error.flatten().fieldErrors);
    }

    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!existing) return notFound(res, 'Lead not found');

    const data = parsed.data;
    if (Object.keys(data).some((k) => ['intentLevel', 'interestCategory', 'platform', 'phone', 'email', 'location', 'fullName', 'budgetRange'].includes(k))) {
      data.leadScore = computeScore({ ...existing, ...data });
    }

    if (data.lastContactedAt) data.lastContactedAt = new Date(data.lastContactedAt);

    const updated = await prisma.lead.update({ where: { id: req.params.id }, data });
    return success(res, updated, 'Lead updated successfully');
  } catch (err) {
    const appErr = handlePrismaError(err);
    return error(res, appErr.message, appErr.statusCode);
  }
};

const deleteLead = async (req, res) => {
  try {
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!existing) return notFound(res, 'Lead not found');

    await prisma.lead.delete({ where: { id: req.params.id } });
    return success(res, null, 'Lead deleted successfully');
  } catch (err) {
    return error(res, 'Failed to delete lead', 500);
  }
};

module.exports = { createLead, getLeads, getLeadById, updateLead, deleteLead };
