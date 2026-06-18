# ─────────────────────────────────────────
# FICHIER : backend/app/main.py
# Point d'entree de l'application FastAPI.
# Lancer avec : uvicorn app.main:app --reload
# ─────────────────────────────────────────
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db.database import Base, engine
from app import models  # noqa: F401 -- import necessaire pour creer toutes les tables
from app.routes import auth, chat, taches, sante, budget, roadmap, rappels

app = FastAPI(
    title="MemoLife API",
    description="Backend de MemoLife — assistant personnel intelligent (IA locale Qwen3 via Ollama)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOSSIER_STATIC = Path("app/static")
DOSSIER_STATIC.mkdir(parents=True, exist_ok=True)
(DOSSIER_STATIC / "audio").mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(DOSSIER_STATIC)), name="static")

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(taches.router)
app.include_router(sante.router)
app.include_router(budget.router)
app.include_router(roadmap.router)
app.include_router(rappels.router)


@app.get("/")
def racine():
    return {
        "application": "MemoLife API",
        "statut": "operationnel",
        "moteur_ia": "Qwen3 4B via Ollama (local)",
        "tts": "Piper TTS (local)",
    }


@app.get("/health")
def verifier_sante():
    return {"statut": "ok"}
