# SCU Professor Finder

A web app that helps Santa Clara University students discover professors using data from the **SCU faculty directory** and **RateMyProfessors**.

## What it does

- **Scrapes** faculty listings from SCU school directory pages (CAS, Business, Engineering, Law, etc.)
- **Fetches** ratings, difficulty, tags, and courses from RateMyProfessors (SCU school ID 1078)
- **Merges** both sources into a local SQLite database
- **Serves** a filterable API and React UI so students can search by department, rating, tenure status, tags, and more
- **Interactive UI**: guided search wizard, quick presets, compare up to 3 professors, save favorites, click tags to filter
- **Optional AI chat** (Anthropic) to get personalized professor recommendations
- **Demo mode** when the backend is offline so you can still explore the UI

## Project structure

```
hackastack-/
├── backend/
│   ├── api/           # FastAPI server
│   ├── scraper/       # SCU + RMP scrapers
│   ├── data/          # SQLite DB (created by scraper)
│   ├── requirements.txt
│   └── .env.example
└── frontend/          # React + Vite + Tailwind
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- (Optional) [Anthropic API key](https://console.anthropic.com/) for the chat feature

## Quick start

### 1. Backend setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and add ANTHROPIC_API_KEY if you want AI chat
```

### 2. Run the scraper (populate the database)

```bash
# From backend/ with venv activated
python -m scraper.run_scraper
```

This writes `backend/data/professors.db`. Re-run periodically to refresh data.

### 3. Start the API

```bash
# From backend/
uvicorn api.main:app --reload --port 8000
```

Health check: http://localhost:8000/api/health

### 4. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the Vite dev server proxies `/api` to the backend.

## Scraper modules

| Module | Purpose |
|--------|---------|
| `scraper/scu_scraper.py` | SCU faculty directory pages |
| `scraper/rmp_scraper.py` | RateMyProfessors GraphQL API |
| `scraper/run_scraper.py` | Merges both sources into SQLite |

Run individual scrapers for debugging:

```bash
python -m scraper.scu_scraper
python -m scraper.rmp_scraper
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/professors` | List/filter professors |
| GET | `/api/professors/{id}` | Single professor |
| GET | `/api/departments` | All departments |
| GET | `/api/tags` | Popular RMP tags |
| POST | `/api/chat` | AI advisor (needs API key) |
| GET | `/api/health` | Health check |

## Legal & ethics

- Use scraped data for **educational / personal** course planning only.
- Respect SCU and RateMyProfessors terms of service; do not hammer endpoints (the scraper includes delays).
- Do not commit `.env` or database files with personal data.

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit and push
4. Open a pull request

## Team

Built for SCU students — Hackastack project (Jorge Garcia Diaz and team).
