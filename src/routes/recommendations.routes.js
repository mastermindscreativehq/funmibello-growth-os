const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  generateRecommendations,
  updateRecommendationStatus,
} = require('../controllers/recommendations.controller');

router.get('/', getRecommendations);
router.post('/generate', generateRecommendations);
router.patch('/:id/status', updateRecommendationStatus);

module.exports = router;
