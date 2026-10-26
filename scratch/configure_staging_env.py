import re
from pathlib import Path

env_path = Path(".env")
staging_path = Path(".env.staging")

if not env_path.is_file():
    raise SystemExit(".env file does not exist")
if not staging_path.is_file():
    raise SystemExit(".env.staging file does not exist")

# Extract key from .env
gemini_key = None
for line in env_path.read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if line.startswith("GEMINI_API_KEY=") and not line.startswith("#"):
        gemini_key = line.split("=", 1)[1].strip()
        break

if not gemini_key:
    raise SystemExit("GEMINI_API_KEY not found in .env")

# Update .env to have LLM_MODEL=gemini-3.8-flash
env_lines = env_path.read_text(encoding="utf-8").splitlines()
has_llm_model = False
new_env_lines = []
for line in env_lines:
    if line.startswith("LLM_MODEL="):
        new_env_lines.append("LLM_MODEL=gemini-3.8-flash")
        has_llm_model = True
    else:
        new_env_lines.append(line)
if not has_llm_model:
    new_env_lines.append("LLM_MODEL=gemini-3.8-flash")
env_path.write_text("\n".join(new_env_lines) + "\n", encoding="utf-8")

# Update .env.staging
staging_lines = staging_path.read_text(encoding="utf-8").splitlines()
new_staging_lines = []
has_staging_key = False
for line in staging_lines:
    if line.startswith("LLM_MODEL="):
        new_staging_lines.append("LLM_MODEL=gemini-3.8-flash")
    elif line.startswith("GEMINI_API_KEY="):
        new_staging_lines.append(f"GEMINI_API_KEY={gemini_key}")
        has_staging_key = True
    else:
        new_staging_lines.append(line)

if not has_staging_key:
    # insert GEMINI_API_KEY right after LLM_MODEL
    idx = -1
    for i, l in enumerate(new_staging_lines):
        if l.startswith("LLM_MODEL="):
            idx = i
            break
    if idx >= 0:
        new_staging_lines.insert(idx + 1, f"GEMINI_API_KEY={gemini_key}")
    else:
        new_staging_lines.append(f"GEMINI_API_KEY={gemini_key}")

staging_path.write_text("\n".join(new_staging_lines) + "\n", encoding="utf-8")
print(f"SUCCESS: Configured staging environment (key configured: {bool(gemini_key)}, length: {len(gemini_key)})")
