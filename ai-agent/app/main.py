from datetime import datetime, timezone

from fastapi import FastAPI

from .schemas import AgentEvent, HealthResponse, RepairAccepted, RepairRequest

app = FastAPI(
    title="FixForge AI Agent",
    description="Internal model-agnostic service boundary for autonomous software repair.",
    version="0.1.0",
)


@app.get("/healthz", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse()


@app.post("/agent/repair", response_model=RepairAccepted, status_code=202)
async def accept_repair(request: RepairRequest) -> RepairAccepted:
    return RepairAccepted(
        repair_id=request.repair_id,
        message="Repair accepted by the agent service; execution begins in a later milestone.",
    )


@app.get("/agent/capabilities", response_model=list[str])
async def capabilities() -> list[str]:
    return [
        "repository-analysis",
        "baseline-testing",
        "repair-planning",
        "patch-generation",
        "sandbox-execution",
        "self-correction",
        "verification",
    ]


@app.get("/agent/events/example", response_model=list[AgentEvent])
async def example_events() -> list[AgentEvent]:
    return [
        AgentEvent(
            event="agent.ready",
            state="INIT",
            message="Agent service is ready to receive repair jobs.",
            created_at=datetime.now(timezone.utc),
        )
    ]