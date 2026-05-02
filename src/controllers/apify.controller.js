// Apify Controller — FUNMI BELLO Fashion Growth OS

const axios = require('axios');

const { processComments } = require('../services/apifyLeadPipeline.service');
const { success, badRequest, error } = require('../utils/response');

const VALID_PLATFORMS = [
  'INSTAGRAM',
  'TIKTOK',
  'TWITTER',
  'FACEBOOK',
  'WHATSAPP',
  'TELEGRAM',
  'MANUAL',
];

// POST /api/apify/ingest-comments
const ingestComments = async (req, res) => {
  try {
    const body = req.body;

    if (!Array.isArray(body) || body.length === 0) {
      return badRequest(res, 'Request body must be a non-empty array of comment objects');
    }

    if (body.length > 500) {
      return badRequest(res, 'Maximum 500 comments per request. Split into smaller batches.');
    }

    for (let i = 0; i < body.length; i++) {
      const item = body[i];

      if (
        !item.commentText ||
        typeof item.commentText !== 'string' ||
        item.commentText.trim() === ''
      ) {
        return badRequest(res, `Comment at index ${i} is missing required field: commentText`);
      }

      if (!item.platform || !VALID_PLATFORMS.includes(item.platform)) {
        return badRequest(
          res,
          `Comment at index ${i} has an invalid or missing platform. Valid values: ${VALID_PLATFORMS.join(', ')}`
        );
      }
    }

    const result = await processComments(body);

    return success(
      res,
      result,
      `Processed ${result.totalReceived} comment(s). ${result.leadsCreated} new lead(s) created, ${result.leadsLinked} linked to existing leads.`
    );
  } catch (err) {
    console.error('[Apify Ingest Error]', err);
    return error(res, 'Failed to process comments. Check server logs.', 500);
  }
};

// POST /api/apify/import-dataset
const importDataset = async (req, res) => {
  try {
    const datasetId = process.env.APIFY_DATASET_ID;
    const token = process.env.APIFY_TOKEN;

    if (!datasetId || !token) {
      return res.status(500).json({
        success: false,
        message: 'Missing APIFY_DATASET_ID or APIFY_TOKEN',
      });
    }

    const url = `https://api.apify.com/v2/datasets/${datasetId}/items?format=json&clean=true&token=${token}`;

    const response = await axios.get(url);
    const items = response.data;

    if (!Array.isArray(items) || items.length === 0) {
      return res.json({
        success: true,
        message: 'No comments found in Apify dataset',
        data: {
          totalReceived: 0,
          commentsSaved: 0,
          leadsCreated: 0,
          leadsLinked: 0,
          results: [],
        },
      });
    }

    const formatted = items
      .filter((item) => item.text && String(item.text).trim() !== '')
      .map((item) => ({
        platform: 'INSTAGRAM',
        username: item.ownerUsername || item.owner?.username || 'unknown',
        displayName: item.owner?.full_name || item.ownerFullName || item.ownerUsername || '',
        profileUrl: item.ownerUsername
          ? `https://instagram.com/${item.ownerUsername}`
          : null,
        commentText: item.text,
        postUrl: item.postUrl || item.url || null,
        postId: item.postId || null,
        commentId: item.id || item.commentId || null,
        likeCount: item.likesCount || item.likeCount || 0,
        publishedAt: item.timestamp || item.createdAt || null,
        rawPayload: item,
      }));

    if (formatted.length === 0) {
      return res.json({
        success: true,
        message: 'Dataset found, but no valid comment text was available',
        data: {
          totalReceived: items.length,
          commentsSaved: 0,
          leadsCreated: 0,
          leadsLinked: 0,
          results: [],
        },
      });
    }

    const result = await processComments(formatted);

    return success(
      res,
      result,
      `Imported ${formatted.length} Apify comment(s). ${result.leadsCreated} new lead(s) created, ${result.leadsLinked} linked to existing leads.`
    );
  } catch (err) {
    console.error('[Apify Import Dataset Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to import Apify dataset',
      error: err.message,
    });
  }
};

module.exports = {
  ingestComments,
  importDataset,
};