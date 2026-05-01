const express = require('express');
const router = express.Router();
const {
  ingestComment,
  getComments,
  getUnprocessedComments,
  classifyComment,
} = require('../controllers/comments.controller');

router.post('/ingest', ingestComment);
router.get('/', getComments);
router.get('/unprocessed', getUnprocessedComments);
router.post('/:id/classify', classifyComment);

module.exports = router;
