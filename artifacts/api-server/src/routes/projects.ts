import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import {
  CreateProjectBody,
  CreateProjectResponse,
  GetProjectParams,
  GetProjectResponse,
  ListProjectsResponse,
} from "@workspace/api-zod";
import { db, projectListStatement, seedDatabase, type ProjectRow } from "@workspace/db";

const router: IRouter = Router();

const toProject = (row: ProjectRow) => ({
  id: row.id,
  name: row.name,
  repository: row.repository,
  language: row.language,
  testFramework: row.test_framework,
  status: row.status,
  repairCount: Number(row.repair_count),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.get("/projects", (_req, res): void => {
  seedDatabase();
  const projects = projectListStatement.all() as unknown as ProjectRow[];
  res.json(ListProjectsResponse.parse(projects.map(toProject)));
});

router.post("/projects", (req, res): void => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = randomUUID();
  db.prepare(`
    INSERT INTO projects (id, name, repository, language, test_framework, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    parsed.data.name,
    parsed.data.repository,
    parsed.data.language,
    parsed.data.testFramework ?? null,
    "ready",
  );

  const row = db.prepare(`
    SELECT p.*, 0 AS repair_count FROM projects p WHERE p.id = ?
  `).get(id) as unknown as ProjectRow;
  res.status(201).json(CreateProjectResponse.parse(toProject(row)));
});

router.get("/projects/:projectId", (req, res): void => {
  const parsed = GetProjectParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const row = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM repair_jobs r WHERE r.project_id = p.id) AS repair_count
    FROM projects p WHERE p.id = ?
  `).get(parsed.data.projectId) as unknown as ProjectRow | undefined;
  if (!row) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(GetProjectResponse.parse(toProject(row)));
});

export default router;