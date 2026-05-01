const app = require('./app');
const env = require('./config/env');
const prisma = require('./lib/prisma');

const start = async () => {
  try {
    await prisma.$connect();
    console.log('[FB-OS] Database connected.');

    app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`\n  FUNMI BELLO Growth OS`);
      console.log(`  ───────────────────────────────────────`);
      console.log(`  Environment : ${env.NODE_ENV}`);
      console.log(`  Port        : ${env.PORT}`);
      console.log(`  Health      : /api/health`);
      console.log(`  Leads       : /api/leads`);
      console.log(`  Comments    : /api/comments`);
      console.log(`  Competitors : /api/competitors`);
      console.log(`  Recs        : /api/recommendations\n`);
    });
  } catch (err) {
    console.error('[FB-OS] Failed to connect to database:', err.message);
    process.exit(1);
  }
};

start();
