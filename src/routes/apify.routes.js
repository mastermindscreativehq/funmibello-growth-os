// Apify Routes — FUNMI BELLO Growth OS

const express = require('express');
const router = express.Router();

const {
  ingestComments,
  importDataset
} = require('../controllers/apify.controller');

// Manual ingestion (works already)
router.post('/ingest-comments', ingestComments);

// 🔥 NEW — Apify dataset import (THIS was missing)
router.post('/import-dataset', importDataset);

module.exports = router;