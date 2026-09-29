# FixForge Security

FixForge treats every repository as untrusted. The first milestone establishes boundaries; the sandbox controls are deliberately reserved for the next milestone rather than being represented as complete.

## Current controls

- SQLite database path is controlled by a `file:` URL or the safe local default.
- API input and output are validated through generated Zod schemas.
- Service logs use structured logging and do not include secrets.
- AI service is isolated behind an internal HTTP boundary.
- No API keys are stored in SQLite.

## Required before repository execution

Before FixForge executes repository code, it must:

- run only inside Docker
- use a non-root user
- cap CPU, memory, processes, output, and duration
- validate repository and file paths against traversal
- block host filesystem and Docker socket access
- isolate environment secrets
- make network access explicit and restricted
- require human approval for pushes, pull requests, CI changes, file deletion, and dependency changes

The system must not report `VERIFIED` without execution evidence from the sandbox.