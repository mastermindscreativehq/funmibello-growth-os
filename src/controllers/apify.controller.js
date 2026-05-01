// Apify Controller — FUNMI BELLO Growth OS
// Handles the POST /api/apify/ingest-comments endpoint.
// Validates the incoming comment array, then passes it to the pipeline service.

const { processComments } = require('../services/apifyLeadPipeline.service');
const { success, badRequest, error } = require('../utils/response');

const VALID_PLATFORMS = ['INSTAGRAM', 'TIKTOK', 'TWITTER', 'FACEBOOK', 'WHATSAPP', 'TELEGRAM', 'MANUAL'];

const ingestComments = async (req, res) => {
  try {
    const body = req.body;

    // Must be a non-empty array
    if (!Array.isArray(body) || body.length === 0) {
      return badRequest(res, 'Request body must be a non-empty array of comment objects');
    }

    // Cap batch size to avoid overloading the database
    if (body.length > 500) {
      return badRequest(res, 'Maximum 500 comments per request. Split into smaller batches.');
    }

    // Validate each comment has the required fields
    for (let i = 0; i < body.length; i++) {
      const item = body[i];

      if (!item.commentText || typeof item.commentText !== 'string' || item.commentText.trim() === '') {
        return badRequest(res, `Comment at index ${i} is missing required field: commentText`);
      }

      if (!item.platform || !VALID_PLATFORMS.includes(item.platform)) {
        return badRequest(
          res,
          `Comment at index ${i} has an invalid or missing platform. Valid values: ${VALID_PLATFORMS.join(', ')}`
        );
      }
    }

    // Run the pipeline
    const result = await processComments(body);

    return success(
      res,
      result,
      `Processed ${result.totalReceived} comment(s). ${result.leadsCreated} new lead(s) created, ${result.leadsLinked} linked to existing leads.`
    );
  } catch (err) {
    console.error('[Apify Ingest Error]', err.message);
    return error(res, 'Failed to process comments. Check server logs.', 500);
  }
};

module.exports = { ingestComments };
