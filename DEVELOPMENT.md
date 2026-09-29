# FixForge Development

## Principles

- Implement milestone by milestone.
- Inspect before editing.
- Keep OpenAPI, generated clients, and server handlers in sync.
- Do not claim a repair is verified without test evidence.
- Keep the agent loop bounded by iteration, model-call, output, repository-size, file-size, and duration limits.

## Checks

```bash
pnpm run typecheck
pnpm --filter @workspace/api-server run build
PYTHONPATH=ai-agent python -m compileall -q ai-agent
```

After changing `lib/api-spec/openapi.yaml`, run:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Next milestone

Add repository upload and analysis for Python projects, including file tree inspection, test framework detection, and a language adapter interface.