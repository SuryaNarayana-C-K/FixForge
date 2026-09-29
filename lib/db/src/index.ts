import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const configuredUrl = process.env.DATABASE_URL;
const sqliteUrl =
  configuredUrl?.startsWith("file:") ? configuredUrl.slice(5) : "database/dev.db";
const databasePath = resolve(process.cwd(), sqliteUrl || "database/dev.db");

mkdirSync(dirname(databasePath), { recursive: true });

export const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    repository TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'Python',
    test_framework TEXT,
    status TEXT NOT NULL DEFAULT 'ready',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS repositories (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    branch TEXT NOT NULL DEFAULT 'main',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS repair_jobs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    issue TEXT NOT NULL,
    model TEXT NOT NULL,
    verification_level TEXT NOT NULL,
    max_iterations INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    iteration INTEGER NOT NULL DEFAULT 0,
    tests_passed INTEGER NOT NULL DEFAULT 0,
    tests_total INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS agent_iterations (
    id TEXT PRIMARY KEY,
    repair_id TEXT NOT NULL REFERENCES repair_jobs(id) ON DELETE CASCADE,
    attempt INTEGER NOT NULL,
    state TEXT NOT NULL,
    hypothesis TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activity_events (
    id TEXT PRIMARY KEY,
    repair_id TEXT REFERENCES repair_jobs(id) ON DELETE SET NULL,
    event TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    repair_id TEXT REFERENCES repair_jobs(id) ON DELETE SET NULL,
    event TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export type ProjectRow = {
  id: string;
  name: string;
  repository: string;
  language: string;
  test_framework: string | null;
  status: string;
  repair_count: number;
  created_at: string;
  updated_at: string;
};

export type RepairJobRow = {
  id: string;
  project_id: string;
  issue: string;
  model: string;
  verification_level: string;
  max_iterations: number;
  status: string;
  iteration: number;
  tests_passed: number;
  tests_total: number;
  created_at: string;
  updated_at: string;
};

export const projectListStatement = db.prepare(`
  SELECT p.*,
    (SELECT COUNT(*) FROM repair_jobs r WHERE r.project_id = p.id) AS repair_count
  FROM projects p
  ORDER BY p.updated_at DESC
`);

export const repairListStatement = db.prepare(`
  SELECT * FROM repair_jobs ORDER BY updated_at DESC
`);

export function seedDatabase(): void {
  const projectCount = db.prepare("SELECT COUNT(*) AS count FROM projects").get() as {
    count: number;
  };
  if (Number(projectCount.count) > 0) {
    return;
  }

  const projectId = "e1a6f7e7-8d3e-4a5a-9f68-2f0c1a5d6e70";
  const repairId = "9f3c98ac-1e63-4c8c-9c3d-3f4dc20f51d1";
  db.prepare(`
    INSERT INTO projects (id, name, repository, language, test_framework, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    projectId,
    "Buggy Python Demo",
    "examples/buggy-python-project",
    "Python",
    "pytest",
    "ready",
  );
  db.prepare(`
    INSERT INTO repair_jobs
      (id, project_id, issue, model, verification_level, max_iterations, status, iteration, tests_passed, tests_total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    repairId,
    projectId,
    "Fix the failing calculator edge-case tests",
    "OpenAI-compatible / default",
    "standard",
    5,
    "testing",
    1,
    7,
    10,
  );
  db.prepare(`
    INSERT INTO activity_events (id, repair_id, event, status, message)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    "c9c1e52e-5df6-4a75-9e3e-2a7ce5aa6fd8",
    repairId,
    "test.completed",
    "warning",
    "Baseline complete: 7 of 10 tests passing.",
  );
}