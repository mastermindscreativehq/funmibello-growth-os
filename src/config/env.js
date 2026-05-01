require('dotenv').config();

const env = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

if (!env.DATABASE_URL) {
  console.error('[FB-OS] FATAL: DATABASE_URL is not set. Add it to your .env file.');
  process.exit(1);
}

module.exports = env;
