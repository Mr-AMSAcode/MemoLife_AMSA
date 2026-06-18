# ─────────────────────────────────────────
# FICHIER : backend/app/db/database.py
# ─────────────────────────────────────────
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/memolife"
)

# Essayez de se connecter a la base configuree; si echec, basculer en SQLite local
from sqlalchemy.exc import OperationalError

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    # Test de connexion rapide
    conn = engine.connect()
    conn.close()
except Exception:
    # Utiliser SQLite en fallback pour demarrer sans Postgres
    sqlite_url = "sqlite:///./memolife_dev.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependance FastAPI : ouvre une session DB, la ferme apres la requete."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
