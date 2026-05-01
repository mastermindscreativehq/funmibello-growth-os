require('./config/env');
const express = require('express');
const cors = require('cors');
const { error } = require('./utils/response');

const healthRoutes = require('./routes/health.routes');
const leadsRoutes = require('./routes/leads.routes');
const commentsRoutes = require('./routes/comments.routes');
const competitorsRoutes = require('./routes/competitors.routes');
const recommendationsRoutes = require('./routes/recommendations.routes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/competitors', competitorsRoutes);
app.use('/api/recommendations', recommendationsRoutes);

app.use((req, res) => {
  error(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
});

app.use((err, req, res, next) => {
  console.error('[FB-OS]', err.message);
  if (err.isOperational) return error(res, err.message, err.statusCode);
  return error(res, 'Internal server error', 500);
});

module.exports = app;
