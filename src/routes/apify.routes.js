// Apify Routes — FUNMI BELLO Growth OS
const express = require('express');
const { ingestComments } = require('../controllers/apify.controller');

const router = express.Router();

// POST /api/apify/ingest-comments
// Accepts an array of scraped comment objects from Apify.
// Classifies each comment and auto-creates leads for HOT/HIGH intent.
router.post('/ingest-comments', ingestComments);

module.exports = router;
