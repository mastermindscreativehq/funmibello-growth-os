# FUNMI BELLO Growth OS — Backend API

Personal AI-powered growth engine for FUNMI BELLO, Abuja's premium men's fashion brand.
Built for leads, social intelligence, competitor tracking, and conversion.

---

## What This Does

- **Lead Database** — Store and score every potential customer from Instagram, TikTok, WhatsApp, and more
- **Comment Ingestion** — Feed raw social media comments in and get instant classification, buying intent, and a ready-to-use reply
- **Lead Scoring** — Each lead gets a 0–100 score based on intent, platform, profile completeness, and fashion category
- **Competitor Tracking** — Log competitor posts and signals; the system feeds them into recommendations
- **Recommendation Engine** — Analyses all data and generates actionable strategy recommendations (content, sales, product, brand)

---

## Prerequisites

- Node.js v18 or higher
- A Supabase account (free tier works)
- npm

---

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to provision (takes ~1 minute)
3. Go to **Settings → Database → Connection String → URI**
4. Copy the URI — it looks like this:

```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

---

## 2. Environment Setup

```bash
cd funmi-bello-growth-os/backend
cp .env.example .env
```

Open `.env` and fill in your values:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Generate Prisma Client & Run Migrations

```bash
# Push the schema to Supabase and generate the Prisma client
npm run db:migrate
```

If that fails (first-time setup), try:

```bash
npm run db:push
npm run db:generate
```

---

## 5. Seed the Database (Optional but Recommended)

Loads example leads, comments, competitors, and recommendations so you can test immediately:

```bash
npm run db:seed
```

---

## 6. Start the Server

```bash
npm run dev
```

You should see:

```
[FB-OS] Database connected.

  FUNMI BELLO Growth OS
  ───────────────────────────────────────
  Environment : development
  Server      : http://localhost:4000
  Health      : http://localhost:4000/api/health
  ...
```

---

## API Reference

### Health

```
GET /api/health
```

---

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leads` | Create a new lead |
| GET | `/api/leads` | List leads (with filters) |
| GET | `/api/leads/:id` | Get lead + comment history |
| PATCH | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |

**GET /api/leads query params:**
- `status` — NEW, QUALIFIED, CONTACTED, INTERESTED, CONVERTED, LOST
- `intentLevel` — LOW, MEDIUM, HIGH, HOT
- `interestCategory` — BESPOKE, READY_TO_WEAR, CAPS, ACCESSORIES, URBAN_FASHION, LUXURY_NATIVE, CASUAL_WEAR
- `platform` — INSTAGRAM, TIKTOK, WHATSAPP, TELEGRAM, etc.
- `search` — searches name, username, phone, email
- `page`, `limit`

---

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/comments/ingest` | Ingest + classify a comment. Auto-creates lead if intent is HIGH/HOT |
| GET | `/api/comments` | List all comments |
| GET | `/api/comments/unprocessed` | Get comments not yet classified |
| POST | `/api/comments/:id/classify` | Re-classify an existing comment |

---

### Competitors

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/competitors` | Add a competitor |
| GET | `/api/competitors` | List all competitors |
| POST | `/api/competitors/:id/signals` | Log a competitor post/signal |
| GET | `/api/competitors/:id/signals` | Get all signals for a competitor |

---

### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | List recommendations |
| POST | `/api/recommendations/generate` | Run analysis and generate fresh recommendations |
| PATCH | `/api/recommendations/:id/status` | Mark as ACTIONED or DISMISSED |

---

## Sample API Calls

### Create a lead manually

```bash
curl -X POST http://localhost:4000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Emeka Obi",
    "username": "emekaobi_",
    "platform": "INSTAGRAM",
    "location": "Abuja",
    "interestCategory": "BESPOKE",
    "intentLevel": "HOT",
    "budgetRange": "80,000 - 200,000",
    "notes": "Wants custom senator for June wedding"
  }'
```

---

### Ingest a social media comment

```bash
curl -X POST http://localhost:4000/api/comments/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "INSTAGRAM",
    "postId": "post_001",
    "username": "kolade_dandy",
    "displayName": "Kolade",
    "commentText": "How much for this? I need it for a wedding in Abuja next month",
    "likeCount": 2
  }'
```

**The system will automatically:**
- Detect: `buyingIntent = HOT`, `fashionInterest = LUXURY_NATIVE`, `detectedNeed = EVENT_STYLING`
- Generate an FB-voice suggested reply
- Create a new lead and link the comment to it

---

### Add a competitor

```bash
curl -X POST http://localhost:4000/api/competitors \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "Lagos Gentleman",
    "instagramHandle": "@lagosgentleman",
    "location": "Lagos, Nigeria",
    "niche": "Menswear, Bespoke, Ready-to-Wear"
  }'
```

---

### Log a competitor signal

```bash
curl -X POST http://localhost:4000/api/competitors/[COMPETITOR_ID]/signals \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "INSTAGRAM",
    "caption": "New limited Aso-Oke collection — DM to reserve.",
    "engagementCount": 1240,
    "likeCount": 1151,
    "commentCount": 89,
    "signalType": "product_launch",
    "insight": "Competitor pushing limited native collection with urgency CTA. FB should counter with bespoke quality narrative."
  }'
```

---

### Generate recommendations

```bash
curl -X POST http://localhost:4000/api/recommendations/generate
```

The engine analyses hot leads, event comments, price inquiries, competitor signals, bespoke demand, and more — then returns a prioritised action list like:

```json
{
  "generated": 6,
  "recommendations": [
    {
      "type": "LEAD",
      "title": "3 Hot Leads Waiting — Follow Up Now",
      "priority": 10,
      "status": "PENDING"
    },
    {
      "type": "CONTENT",
      "title": "Push Event Styling Content — Multiple Signals Around Events",
      "priority": 9
    }
  ]
}
```

---

### Mark a recommendation as actioned

```bash
curl -X PATCH http://localhost:4000/api/recommendations/[REC_ID]/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "ACTIONED" }'
```

---

## Folder Structure

```
backend/
├── src/
│   ├── app.js                          Express app setup
│   ├── server.js                       Entry point
│   ├── config/
│   │   └── env.js                      Environment variable loader
│   ├── lib/
│   │   └── prisma.js                   PrismaClient singleton
│   ├── prisma/
│   │   ├── schema.prisma               Database schema
│   │   └── seed.js                     Seed script
│   ├── routes/
│   │   ├── health.routes.js
│   │   ├── leads.routes.js
│   │   ├── comments.routes.js
│   │   ├── competitors.routes.js
│   │   └── recommendations.routes.js
│   ├── controllers/
│   │   ├── leads.controller.js
│   │   ├── comments.controller.js
│   │   ├── competitors.controller.js
│   │   └── recommendations.controller.js
│   ├── services/
│   │   ├── leadScoring.service.js      Scores leads 0–100
│   │   ├── commentClassifier.service.js  Classifies comments (no AI API needed)
│   │   └── recommendationEngine.service.js  Generates action intelligence
│   └── utils/
│       ├── response.js                 Standardised JSON responses
│       └── errors.js                   Error classes + Prisma error handler
├── .env.example
└── package.json
```

---

## Test Sequence After Setup

Run these in order to verify everything works:

1. `GET /api/health` — confirm server is running
2. `POST /api/leads` — create a test lead
3. `GET /api/leads` — confirm it appears
4. `POST /api/comments/ingest` — ingest a comment with buying intent keywords
5. `GET /api/leads` — confirm the lead was auto-created
6. `POST /api/competitors` — add a competitor
7. `POST /api/competitors/:id/signals` — log a signal
8. `POST /api/recommendations/generate` — generate your first action plan
9. `GET /api/recommendations` — view all recommendations

---

## Railway Production Deployment

### Setup

1. Push the repo to GitHub (if not already done)
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
3. Select your repo
4. In **Settings → General**, set the **Root Directory** to:
   ```
   funmi-bello-growth-os/backend
   ```
5. Railway will auto-detect Node.js and run `npm start`

### Environment Variables (Railway → Variables tab)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase PostgreSQL connection string |
| `PORT` | Leave blank — Railway injects this automatically |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | Your frontend URL (or `*` temporarily) |

> `PORT` is set by Railway at runtime. The server reads `process.env.PORT` and defaults to `4000` locally.

### First Deploy — Run Migrations

After the first deploy completes, open **Railway → your service → Shell** (or use the Railway CLI) and run:

```bash
npm run db:migrate
```

This applies all Prisma migrations to your production database. Only needs to run once per schema change.

### Verify

```bash
curl https://your-app.up.railway.app/api/health
```

---

## Phase 2 Plans (Not Yet Built)

- WhatsApp/Telegram bot integration for lead capture
- Instagram scraper for comment ingestion
- Admin dashboard (React/Next.js)
- AI-powered comment classification upgrade (Claude API)
- Automated follow-up scheduling
- Sales funnel analytics

---

*Built for FUNMI BELLO — Abuja Premium Menswear.*
