# [KisanDisha 🧭](#)

<p align="center">
  <strong>An AI-powered market intelligence platform for Indian farmers, built with Next.js, TypeScript, and real government price data.</strong>
</p>

<p align="center">
  <a href="#">🌐 Live Demo</a> •
  <a href="https://github.com/vaidikdubey/KisanDisha">📂 Repository</a>
</p>

---

## 📖 Overview

KisanDisha turns raw, publicly available government market price data
(data.gov.in / Agmarknet) into a straight answer for farmers: where should
I actually sell this crop, right now. Prices are ingested daily and
automatically, compared across markets, and an AI advisor reasons over
real price, trend, and proximity data to recommend the best option - no
account required to browse prices, full features behind a lightweight login.

---

## ✨ Features

### 🌾 Live Market Data

- Daily, automated ingestion from the government's Agmarknet API
- Historical prices backfilled from public 2023–2025 data, so trends work from day one
- Row-level validation - bad or missing data is surfaced, not silently dropped

### 📊 Price Comparison

- Filter by crop, sort by price or trend
- Nearest markets with best price, ranked by region

### 🤖 AI Selling Advisor

- Ask in plain language: *"500kg tomatoes near Bhopal, where do I sell?"*
- Powered by the **Google Gemini API** with tool-calling - the agent
  queries live price, trend, and proximity data rather than guessing
- Accuracy tracked against a written evaluation set, not just demoed

### 👤 User Profile

- Home region and crop preferences, used to personalize the advisor and
  the nearest-market view

### ⚙️ Reliability by Design

- Idempotent ingestion - a retried or failed job never creates duplicate records
- Retry/backoff against real external API rate limits
- Rate limiting on public endpoints
- Redis caching on comparison queries, invalidated on each ingestion run

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js API Routes
- PostgreSQL (Neon)
- Prisma ORM
- Redis (Upstash)

### Ingestion & Infra

- AWS Lambda + EventBridge (scheduled daily ingestion)
- data.gov.in / Agmarknet API

### AI

- Google Gemini API (tool-calling agent)

### Deployment

- Vercel (web/API)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn
- PostgreSQL database (Neon recommended)
- Redis instance (Upstash recommended)
- Google Gemini API key
- data.gov.in API key

### Clone the Repository

```bash
git clone https://github.com/vaidikdubey/KisanDisha.git

cd KisanDisha
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file in the root directory.

```env
DATABASE_URL=

REDIS_URL=

NEXTAUTH_SECRET=

NEXT_PUBLIC_APP_URL=http://localhost:3000

GEMINI_API_KEY=

AGMARKNET_API_KEY=
```

> **Note:** Replace the values above with your own credentials before running the project.

### Run the Development Server

```bash
npm run dev
```

Visit:

```link
http://localhost:3000
```

---

## 📂 Project Structure

```text
KisanDisha/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── agent/          # AI advisor tool definitions + reasoning loop
│   │   ├── ingestion/      # Agmarknet fetch, validation, upsert logic
│   ├── models/ (or prisma/schema.prisma)
│   ├── types/
│   ├── middleware.ts
│   └── ...
│
├── worker/                 # AWS Lambda ingestion handler
├── public/
├── .env.local
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## ⚡ Reliability & Performance

- Idempotent upserts on ingestion - safe to retry, never duplicates
- Retry/backoff against real API rate limits
- Cache-aside pattern on frequent price queries
- Structured logging tagged with job IDs, so a failed ingestion run is traceable

---

## 🔒 Authentication

Lightweight auth - enough to personalize the advisor and save region/crop
preferences. Price browsing itself requires no account.

---

## 🤖 AI Integration

The advisor is a tool-calling agent, not a wrapped prompt. It calls
structured functions - `get_prices`, `get_trend`, `get_nearby_markets` -
against the same database the UI reads from, so every recommendation is
grounded in real, current data. Accuracy is measured against a written
evaluation set of realistic scenarios.

---

## 📸 Application Workflow

```text
Daily Scheduled Trigger (AWS EventBridge)
    │
    ▼
Lambda Fetches Agmarknet Prices
    │
    ▼
Validate + Idempotent Upsert → PostgreSQL
    │
    ▼
User Browses Prices / Asks the Advisor
    │
    ▼
Advisor Calls Tools (price, trend, proximity)
    │
    ▼
Grounded Recommendation Returned
```

---

## 🌐 Live Demo

**Website**
[KisanDisha](#)

---

## 📦 Repository

**GitHub**
[KisanDisha-Github](https://github.com/vaidikdubey/KisanDisha)

---

## 🔮 Future Improvements

- True geocoded distance ranking (currently district/state-level)
- Price alerts on threshold crossing
- Broader crop and state coverage
- Trend forecasting
- Multi-user / cooperative accounts
- Mobile app (React Native - Android + iOS)
- Vendor directory and price comparison for farm inputs (seeds, fertilizer, pesticides)
- Marketplace features (listings, orders)
- Logistics coordination

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

If you'd like to contribute:

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

4. Push to your branch

```bash
git push origin feature/amazing-feature
```

5. Open a pull request

## 👨‍💻 Author

**Vaidik Dubey**

- GitHub: https://github.com/vaidikdubey
- LinkedIn: https://www.linkedin.com/in/vaidik-dubey/

---

<p align="center">
Built with ❤️ using Next.js, TypeScript, PostgreSQL, AWS Lambda, Redis, and Google Gemini AI.
</p>
