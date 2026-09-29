import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import {
  CreateRepairBody,
  CreateRepairResponse,
  GetRepairParams,
  GetRepairResponse,
  ListRepairsResponse,
} from "@workspace/api-zod";
import { db, repairListStatement, seedDatabase, type RepairJobRow } from "@workspace/db";

const router: IRouter = Router();

const toRepair = (row: RepairJobRow) => ({
  id: row.id,
  projectId: row.project_id,
  issue: row.issue,
  model: row.model,
  verificationLevel: row.verification_level,
  maxIterations: Number(row.max_iterations),
  status: row.status,
  iteration: Number(row.iteration),
  testsPassed: Number(row.tests_passed),
  testsTotal: Number(row.tests_total),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.get("/repairs", (_req, res): void => {
  seedDatabase();
  const repairs = repairListStatement.all() as unknown as RepairJobRow[];
  res.json(ListRepairsResponse.parse(repairs.map(toRepair)));
});

router.post("/repairs", (req, res): void => {
  const parsed = CreateRepairBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const project = db
    .prepare("SELECT id FROM projects WHERE id = ?")
    .get(parsed.data.projectId) as { id: string } | undefined;
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const id = randomUUID();
  db.prepare(`
    INSERT INTO repair_jobs
      (id, project_id, issue, model, verification_level, max_iterations, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    parsed.data.projectId,
    parsed.data.issue,
    parsed.data.model,
    parsed.data.verificationLevel,
    parsed.data.maxIterations,
    "queued",
  );
  db.prepare(`
    INSERT INTO activity_events (id, repair_id, event, status, message)
    VALUES (?, ?, ?, ?, ?)
  `).run(randomUUID(), id, "agent.started", "info", "Repair job queued.");

  const row = db.prepare("SELECT * FROM repair_jobs WHERE id = ?").get(id) as unknown as RepairJobRow;
  res.status(201).json(CreateRepairResponse.parse(toRepair(row)));
});

router.get("/repairs/:repairId", (req, res): void => {
  const parsed = GetRepairParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const row = db.prepare("SELECT * FROM repair_jobs WHERE id = ?").get(parsed.data.repairId) as unknown as RepairJobRow | undefined;
  if (!row) {
    res.status(404).json({ error: "Repair job not found" });
    return;
  }

  res.json(GetRepairResponse.parse(toRepair(row)));
});

export default router;