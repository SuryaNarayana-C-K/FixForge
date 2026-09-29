import { Router, type IRouter } from "express";
import {
  GetActivityQueryParams,
  GetActivityResponse,
  GetDashboardSummaryResponse,
} from "@workspace/api-zod";
import { db, seedDatabase } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", (_req, res): void => {
  seedDatabase();
  const summary = db.prepare(`
    SELECT
      SUM(CASE WHEN status IN ('queued', 'analyzing', 'patching', 'testing', 'self_correcting', 'verifying') THEN 1 ELSE 0 END) AS active_repairs,
      SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) AS completed_repairs,
      SUM(CASE WHEN status IN ('failed', 'timeout', 'cancelled') THEN 1 ELSE 0 END) AS failed_repairs,
      AVG(CASE WHEN status = 'verified' THEN iteration END) AS average_iterations,
      COUNT(*) AS total_repairs
    FROM repair_jobs
  `).get() as {
    active_repairs: number | null;
    completed_repairs: number | null;
    failed_repairs: number | null;
    average_iterations: number | null;
    total_repairs: number;
  };
  const completed = Number(summary.completed_repairs ?? 0);
  const failed = Number(summary.failed_repairs ?? 0);
  const total = Number(summary.total_repairs ?? 0);
  const response = {
    activeRepairs: Number(summary.active_repairs ?? 0),
    completedRepairs: completed,
    failedRepairs: failed,
    successRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    averageIterations: Number(summary.average_iterations ?? 0),
    averageRepairTimeSeconds: 0,
  };
  res.json(GetDashboardSummaryResponse.parse(response));
});

router.get("/activity", (req, res): void => {
  seedDatabase();
  const parsed = GetActivityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = db.prepare(`
    SELECT id, event, status, message, repair_id, created_at
    FROM activity_events
    ORDER BY created_at DESC
    LIMIT ?
  `).all(parsed.data.limit) as unknown as Array<{
    id: string;
    event: string;
    status: string;
    message: string;
    repair_id: string | null;
    created_at: string;
  }>;
  res.json(GetActivityResponse.parse(rows.map((row) => ({
    id: row.id,
    event: row.event,
    status: row.status,
    message: row.message,
    repairId: row.repair_id,
    createdAt: row.created_at,
  }))));
});

export default router;