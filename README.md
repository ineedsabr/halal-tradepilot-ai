# Halal TradePilot AI

Monorepo skeleton for the Halal TradePilot AI project.

## Structure

- `apps/webapp` - Vite React TypeScript Telegram Web App skeleton
- `apps/admin` - Vite React TypeScript Admin Panel skeleton
- `backend` - FastAPI backend foundation
- `infra` - infrastructure placeholders
- `docs` - project documentation

## Requirements

- Node.js 20+
- npm 10+
- Python 3.11+
- Docker and Docker Compose

## Setup

```bash
cp .env.example .env
npm install
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

## Run Locally

Default local ports:

- Backend API: `8000`
- Web App: `5173`
- Admin Panel: `3001`

Web App:

```bash
npm run dev:webapp
```

Admin Panel:

```bash
npm run dev:admin
```

API:

```bash
npm run dev:backend
```

The backend uses SQLite for local development only. PostgreSQL is required for production and MVP deployment.

All services with Docker Compose:

```bash
docker compose up --build
```

## Checks

```bash
npm run typecheck
python -m compileall backend
pytest backend/tests
```

## Known Limitations

- This is still an early backend foundation.
- Task 2 contains no business logic.
- No business logic is implemented.
- No signals functionality is implemented.
- No AI functionality is implemented.
- No database models, authentication, Telegram SDK integration, or deployment pipeline is configured.
