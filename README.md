# SCU Course Optimizer

A web app for **Santa Clara University** students to explore professors using the official **SCU faculty directory**, **RateMyProfessors** (school ID 1078), and **registrar schedule PDFs** (Workday exports). Built for Hackastack.

## What it does

- **Scrapes** faculty from SCU school directory pages (CAS, Business, Engineering, Law, and more)
- **Parses** undergraduate schedule PDFs from the Registrar for courses, sections, and weekly meeting times
- **Fetches** ratings, difficulty, tags, and courses from RateMyProfessors
- **Merges** everything into a local SQLite database (`backend/data/professors.db`)
- **Serves** a filterable FastAPI backend and a React UI with grid and calendar views
- **Landing page** with product overview before entering the app
- **Search & filters**: department, school, rating, difficulty, would-take-again %, tenure, course code, RMP tags, sort options
- **Guided wizard**, quick presets, compare up to 3 professors, favorites, click tags to filter
- **AI voice advisor** (optional): real-time voice via Tencent TRTC — Deepgram STT, OpenAI-compatible LLM, ElevenLabs TTS
- **Demo mode**: if the API is unreachable, the UI falls back to bundled sample data

## Project structure

```
hackastack-/
├── backend/
│   ├── api/                 # FastAPI server (professors, departments, tags, health)
│   ├── scraper/
│   │   ├── scu_scraper.py       # SCU faculty directory
│   │   ├── schedule_scraper.py  # Registrar schedule PDFs
│   │   ├── rmp_scraper.py       # RateMyProfessors
│   │   └── run_scraper.py       # Merge pipeline
│   ├── scripts/
│   │   ├── db_stats.py          # Quick DB counts
│   │   └── test_rmp.py          # RMP fetch smoke test
│   ├── trtc/                    # Optional Node voice-AI server (port 3000)
│   ├── data/                    # SQLite DB (created by scraper; not committed)
│   ├── requirements.txt
│   └── .env.example
└── frontend/                    # React + Vite + Tailwind
    ├── src/
    └── .env.example             # Optional Anthropic key (legacy text-chat middleware)
```

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- For voice AI (optional): Tencent Cloud TRTC, Deepgram, OpenAI (or compatible), and ElevenLabs credentials — see `backend/trtc/.env.example`

## Quick start

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` if needed (`DATABASE_PATH`, optional `ANTHROPIC_API_KEY` for the backend `/api/chat` endpoint).

### 2. Populate the database

```bash
# From backend/ with venv activated
# On Windows, if the scraper prints Unicode errors, run:
#   $env:PYTHONIOENCODING = "utf-8"
python -m scraper.run_scraper
```

Pipeline steps:

1. Parse registrar schedule PDFs  
2. Scrape SCU faculty directory  
3. Fetch RateMyProfessors (SCU)  
4. Merge and write `backend/data/professors.db`

Re-run when a new term’s schedule PDF is published (update URLs in `scraper/schedule_scraper.py` if needed).

Debug individual modules:

```bash
python -m scraper.scu_scraper
python -m scraper.rmp_scraper
python scripts/test_rmp.py
python scripts/db_stats.py
```

### 3. Start the API

```bash
# From backend/
uvicorn api.main:app --reload --port 8000
```

Health check: http://localhost:8000/api/health

### 4. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api` to the backend on port 8000.

### 5. Voice AI (optional)

In a third terminal:

```bash
cd backend/trtc
npm install express tencentcloud-sdk-nodejs-trtc dotenv
cp .env.example .env
# Fill in Tencent, Deepgram, LLM, and ElevenLabs credentials
node index.js
```

The frontend proxies `/trtc-api/*` → `http://localhost:3000`. Voice chat uses the Tencent TRTC Web SDK (loaded in `frontend/index.html`).

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/professors` | List/filter professors |
| GET | `/api/professors/{id}` | Single professor |
| GET | `/api/departments` | Departments and schools |
| GET | `/api/tags` | Popular RMP tags |
| POST | `/api/chat` | Text advisor (requires `ANTHROPIC_API_KEY` in `backend/.env`) |
| GET | `/api/health` | Health check |

In dev, `frontend/vite.config.ts` can also handle `POST /api/chat` when `ANTHROPIC_API_KEY` is set in `frontend/.env` (the live app UI uses **Tencent voice chat**, not this text path).

## Legal & ethics

- Use data for **educational / personal** course planning only.
- Respect SCU, the Registrar, and RateMyProfessors terms of service; the scrapers use delays — do not hammer endpoints.
- Do not commit `.env`, API keys, or `backend/data/professors.db`.

## Team

Hackastack — Santa Clara University

- Cuitlahuac Ramirez Borrego  
- Estevan Rodriguez  
- Jorge Garcia Diaz  
- Damian Barba  
