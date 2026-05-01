const express = require('express');
const router = express.Router();
const { success } = require('../utils/response');

router.get('/', (req, res) => {
  success(res, {
    service: 'FUNMI BELLO Growth OS',
    version: '1.0.0',
    status: 'operational',
    brand: 'FB — Abuja Premium Menswear',
    timestamp: new Date().toISOString(),
  }, 'System is healthy and ready.');
});

module.exports = router;
