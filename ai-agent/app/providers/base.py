from abc import ABC, abstractmethod
from typing import Any


class LLMProvider(ABC):
    """Provider-neutral interface for future repair reasoning."""

    @abstractmethod
    async def complete(self, messages: list[dict[str, str]], **kwargs: Any) -> str:
        raise NotImplementedError