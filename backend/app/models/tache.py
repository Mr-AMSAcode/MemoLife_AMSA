# ─────────────────────────────────────────
# FICHIER : backend/app/models/tache.py
# ─────────────────────────────────────────
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Tache(Base):
    __tablename__ = "taches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    roadmap_id = Column(UUID(as_uuid=True), ForeignKey("roadmaps.id"), nullable=True)

    titre = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    statut = Column(
        SAEnum("A_FAIRE", "EN_COURS", "FAITE", "RATEE", "REPORTEE", name="statut_tache_enum"),
        default="A_FAIRE",
    )
    priorite = Column(
        SAEnum("BASSE", "NORMALE", "HAUTE", name="priorite_enum"),
        default="NORMALE",
    )
    date_echeance = Column(DateTime, nullable=True)
    source = Column(SAEnum("MANUELLE", "IA", name="source_enum"), default="MANUELLE")

    created_at = Column(DateTime, default=datetime.utcnow)

    utilisateur = relationship("Utilisateur", back_populates="taches")
    roadmap = relationship("Roadmap", back_populates="taches")
    rappels = relationship("Rappel", back_populates="tache", cascade="all, delete-orphan")

    def marquer_faite(self):
        self.statut = "FAITE"

    def reporter(self, nouvelle_date: datetime):
        self.date_echeance = nouvelle_date
        self.statut = "REPORTEE"
