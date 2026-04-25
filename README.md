# Halal TradePilot AI

Monorepo skeleton for the Halal TradePilot AI project.

## Structure

- `apps/webapp` - Vite React TypeScript Telegram Web App skeleton
- `apps/admin` - Vite React TypeScript Admin Panel skeleton
- `backend` - FastAPI backend skeleton
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

All services with Docker Compose:

```bash
docker compose up --build
```

## Checks

```bash
npm run typecheck
python -m compileall backend
```

## Known Limitations

- This is only the Task 1 monorepo skeleton.
- No business logic is implemented.
- No signals functionality is implemented.
- No AI functionality is implemented.
- No database, authentication, Telegram SDK integration, or deployment pipeline is configured.
