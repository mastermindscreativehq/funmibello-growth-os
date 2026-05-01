const express = require('express');
const router = express.Router();
const {
  createCompetitor,
  getCompetitors,
  addCompetitorSignal,
  getCompetitorSignals,
} = require('../controllers/competitors.controller');

router.post('/', createCompetitor);
router.get('/', getCompetitors);
router.post('/:id/signals', addCompetitorSignal);
router.get('/:id/signals', getCompetitorSignals);

module.exports = router;
