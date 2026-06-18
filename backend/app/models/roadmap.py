# ─────────────────────────────────────────
# FICHIER : backend/app/models/roadmap.py
# ─────────────────────────────────────────
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)

    titre = Column(String, nullable=False)
    type = Column(SAEnum("FORMATION", "PROJET", name="type_roadmap_enum"), nullable=False)
    date_debut = Column(DateTime, default=datetime.utcnow)
    date_fin = Column(DateTime, nullable=True)
    progression_pct = Column(Float, default=0.0)

    taches = relationship("Tache", back_populates="roadmap")

    def calculer_progression(self):
        if not self.taches:
            return 0.0
        faites = sum(1 for t in self.taches if t.statut == "FAITE")
        return round((faites / len(self.taches)) * 100, 1)
