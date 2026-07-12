"""Vercel ASGI entry point for the FlowOS backend."""
import os

if os.getenv("VERCEL") and not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "sqlite:////tmp/baiterek.db"

from app.main import app  # noqa: E402

__all__ = ["app"]

