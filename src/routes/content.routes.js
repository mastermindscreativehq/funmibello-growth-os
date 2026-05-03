const express = require('express');
const router = express.Router();
const { generateIdeas } = require('../controllers/content.controller');

router.post('/generate-ideas', generateIdeas);

module.exports = router;
