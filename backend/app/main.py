from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import MOCK_MODE, SUPPORTED_LANGUAGES
from app.database import init_db
from app.routers import session

app = FastAPI(
    title="Saathi-Voice Stress Classification API",
    description=(
        "Analyzes an uploaded/recorded voice note in a preset Indian "
        "language, fuses acoustic + semantic + longitudinal signals into a "
        "Composite Distress Index (CDI), and classifies it into the 4-tier "
        "support/triage structure."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to known frontend origins before prod
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "mock_mode": MOCK_MODE,
        "supported_languages": SUPPORTED_LANGUAGES,
    }
