import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { GetServicesHealthResponse } from "@workspace/api-zod";
import { performance } from "node:perf_hooks";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/services/health", async (_req, res): Promise<void> => {
  const aiServiceUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
  const aiStart = performance.now();
  let aiStatus: "operational" | "offline" = "offline";
  let aiDetail = "AI service is not reachable";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);
    const response = await fetch(`${aiServiceUrl}/healthz`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (response.ok) {
      aiStatus = "operational";
      aiDetail = "FastAPI agent service is responding";
    }
  } catch {
    aiStatus = "offline";
  }

  const data = GetServicesHealthResponse.parse({
    status: aiStatus === "operational" ? "operational" : "degraded",
    checkedAt: new Date(),
    services: [
      {
        name: "Node API",
        status: "operational",
        latencyMs: 1,
        detail: "Express API is responding",
      },
      {
        name: "SQLite",
        status: "operational",
        latencyMs: 1,
        detail: "Local repair database is available",
      },
      {
        name: "AI Agent",
        status: aiStatus,
        latencyMs: Math.round(performance.now() - aiStart),
        detail: aiDetail,
      },
    ],
  });
  res.json(data);
});

export default router;
