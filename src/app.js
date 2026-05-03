require('./config/env');

const express = require('express');
const cors = require('cors');
const { error } = require('./utils/response');

const healthRoutes = require('./routes/health.routes');
const leadsRoutes = require('./routes/leads.routes');
const commentsRoutes = require('./routes/comments.routes');
const competitorsRoutes = require('./routes/competitors.routes');
const recommendationsRoutes = require('./routes/recommendations.routes');
const apifyRoutes = require('./routes/apify.routes');
const contentRoutes = require('./routes/content.routes');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/competitors', competitorsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/apify', apifyRoutes);
app.use('/api/content', contentRoutes);

// 404 handler
app.use((req, res) => {
  return error(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[FB-OS]', err.message);

  if (err.isOperational) {
    return error(res, err.message, err.statusCode);
  }

  return error(res, 'Internal server error', 500);
});

module.exports = app;