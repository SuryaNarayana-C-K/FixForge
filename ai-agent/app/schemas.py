from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: str = "fixforge-ai-agent"
    version: str = "0.1.0"


class RepairRequest(BaseModel):
    repair_id: UUID
    repository: str
    issue: str = Field(min_length=1)
    model: str = "default"
    max_iterations: int = Field(default=5, ge=1, le=10)


class AgentEvent(BaseModel):
    event: str
    state: str
    message: str
    created_at: datetime


class RepairAccepted(BaseModel):
    repair_id: UUID
    status: Literal["accepted"] = "accepted"
    message: str