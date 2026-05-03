const axios = require('axios');
const { processComments } = require('../services/apifyLeadPipeline.service');
const { success, badRequest, error } = require('../utils/response');

const VALID_PLATFORMS = ['INSTAGRAM', 'TIKTOK', 'TWITTER', 'FACEBOOK', 'WHATSAPP', 'TELEGRAM', 'MANUAL'];

// =========================
// INGEST COMMENTS (WORKING)
// =========================
const ingestComments = async (req, res) => {
  try {
    const body = req.body;

    if (!Array.isArray(body) || body.length === 0) {
      return badRequest(res, 'Request body must be a non-empty array');
    }

    if (body.length > 500) {
      return badRequest(res, 'Max 500 comments per request');
    }

    for (let i = 0; i < body.length; i++) {
      const item = body[i];

      if (!item.commentText || typeof item.commentText !== 'string') {
        return badRequest(res, `Missing commentText at index ${i}`);
      }

      if (!item.platform || !VALID_PLATFORMS.includes(item.platform)) {
        return badRequest(res, `Invalid platform at index ${i}`);
      }
    }

    const result = await processComments(body);

    return success(res, result, `Processed ${result.totalReceived} comments`);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to process comments', 500);
  }
};

// =========================
// IMPORT DATASET (FIXED)
// =========================
const importDataset = async (req, res) => {
  try {
    const datasetId = process.env.APIFY_DATASET_ID;
    const token = process.env.APIFY_TOKEN;

    if (!datasetId || !token) {
      return res.status(500).json({
        success: false,
        message: 'Missing APIFY env variables'
      });
    }

    // ✅ FIXED URL
    const url = `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=json&token=${token}`;

    console.log('Fetching dataset:', url);

    const response = await axios.get(url);
    const items = response.data;

    if (!items || items.length === 0) {
      return res.json({
        success: true,
        message: 'Dataset empty'
      });
    }

    // ✅ TRANSFORM CORRECTLY
    const formatted = items.map(item => ({
      platform: 'INSTAGRAM',
      commentText: item.text || '',
      username: item.ownerUsername || 'unknown',
      displayName: item.owner?.full_name || '',
      rawPayload: item
    }));

    const result = await processComments(formatted);

    return res.json({
      success: true,
      message: 'Dataset imported successfully',
      data: result
    });

  } catch (err) {
    console.error('IMPORT ERROR:', err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to import Apify dataset',
      error: err.response?.data || err.message
    });
  }
};

module.exports = {
  ingestComments,
  importDataset
};