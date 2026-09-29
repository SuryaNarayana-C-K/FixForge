# FixForge API

The API is served by the Node/Express service under the `/api` prefix.

## Health

- `GET /api/healthz` — Node API liveness.
- `GET /api/services/health` — Node API, SQLite, and AI service status.

## Dashboard

- `GET /api/dashboard/summary` — active, completed, failed, success rate, and iteration metrics.
- `GET /api/activity?limit=8` — recent repair activity.

## Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`

Create body:

```json
{
  "name": "Buggy Python Demo",
  "repository": "examples/buggy-python-project",
  "language": "Python",
  "testFramework": "pytest"
}
```

## Repairs

- `GET /api/repairs`
- `POST /api/repairs`
- `GET /api/repairs/:repairId`

Repair creation records intent and returns a queued job. Actual repository analysis and execution will be added in the repair-loop milestone.