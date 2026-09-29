# FixForge Architecture

## Service boundaries

```text
React + Vite
    ↓ REST / generated React Query hooks
Node.js + Express API
    ↓ local persistence
SQLite
    ↓ internal HTTP boundary
FastAPI AI Agent
    ↓ future graph orchestration
LangGraph + model provider abstraction
```

The Node API owns users, projects, repositories, repair jobs, activity, and audit records. The Python service owns agent orchestration and will never be imported directly into the Node application.

## Current data model

SQLite stores the core entities needed for the repair lifecycle:

- `users`
- `projects`
- `repositories`
- `repair_jobs`
- `agent_iterations`
- `activity_events`
- `audit_logs`

The database is initialized on API startup and seeded with a small demo project when empty. The seed is intentionally minimal so the dashboard is useful without hiding the fact that real repository analysis is not implemented yet.

## Contract-first API

`lib/api-spec/openapi.yaml` is the source of truth. Orval generates:

- React Query hooks in `lib/api-client-react`
- Zod request and response schemas in `lib/api-zod`

The server validates request bodies, query parameters, and response payloads with the generated schemas.

## Planned repair graph

The Python agent will add explicit LangGraph states:

`INIT → REPOSITORY_ANALYSIS → BASELINE_TESTING → FAILURE_DETECTION → ROOT_CAUSE_ANALYSIS → REPAIR_PLANNING → PATCH_GENERATION → PATCH_VALIDATION → PATCH_APPLICATION → SANDBOX_EXECUTION → TESTING → OBSERVATION → VERIFICATION`

Failed tests will enter `FAILURE_ANALYSIS → SELF_CORRECTION` and retry only while the configured iteration and cost limits permit.