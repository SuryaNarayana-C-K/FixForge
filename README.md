# FixForge

FixForge is an autonomous software repair platform foundation. It is designed around a strict rule:

> Generated is not fixed. Executed + tested + verified is fixed.

The first milestone provides a runnable React/Vite control room, a Node/Express API, a local SQLite database, and a separate FastAPI/LangGraph service boundary for the future repair agent.

## Milestone 1

Included:

- React/Vite frontend at `/`
- Node.js + Express API under `/api`
- SQLite persistence in `database/dev.db`
- FastAPI AI service under `ai-agent/`
- Health checks for the Node API, SQLite, and AI service
- Project and repair-job records
- Dashboard summary and recent activity endpoints
- Typed OpenAPI contract with generated React Query and Zod clients
- Seeded Buggy Python Demo project for the first repair milestone

Not included yet:

- Repository uploads or GitHub cloning
- Docker sandbox execution
- Live WebSocket repair events
- LLM calls or patch generation
- Authentication

## Run

Install workspace dependencies with pnpm. The Python dependencies are managed by the Replit Python environment and are also listed in `ai-agent/requirements.txt`.

Start the services from the configured workflows:

- `artifacts/fixforge: web`
- `artifacts/api-server: API Server`
- `FixForge AI Agent`

Useful checks:

```bash
pnpm run typecheck
pnpm --filter @workspace/api-server run build
PYTHONPATH=ai-agent python -m compileall -q ai-agent
```

## API

The OpenAPI source of truth is `lib/api-spec/openapi.yaml`.

Regenerate clients after changing it:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Available API groups:

- `GET /api/healthz`
- `GET /api/services/health`
- `GET /api/dashboard/summary`
- `GET /api/activity`
- `GET|POST /api/projects`
- `GET /api/projects/:projectId`
- `GET|POST /api/repairs`
- `GET /api/repairs/:repairId`

## Roadmap

1. Repository analysis and Python language adapter
2. Isolated Docker sandbox
3. Baseline tests and first repair
4. Self-correction loop with bounded iterations
5. WebSocket activity streaming and verification reports
6. Authentication and human-approved GitHub actions