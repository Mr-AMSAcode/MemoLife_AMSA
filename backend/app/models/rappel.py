# ─────────────────────────────────────────
# FICHIER : backend/app/models/rappel.py
# ─────────────────────────────────────────
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Rappel(Base):
    __tablename__ = "rappels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tache_id = Column(UUID(as_uuid=True), ForeignKey("taches.id"), nullable=False)

    planifie_a = Column(DateTime, nullable=False)
    texte_a_lire = Column(Text, nullable=False)
    canal = Column(
        SAEnum("ALARME", "VOCAL", "VOCAL_TEXTE", name="canal_rappel_enum"),
        default="VOCAL_TEXTE",
    )
    statut = Column(
        SAEnum("PLANIFIE", "DECLENCHE", "CONFIRME", "IGNORE", name="statut_rappel_enum"),
        default="PLANIFIE",
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    tache = relationship("Tache", back_populates="rappels")

    def declencher(self):
        self.statut = "DECLENCHE"


class PreferenceRappel(Base):
    __tablename__ = "preferences_rappel"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), unique=True, nullable=False)

    canal = Column(
        SAEnum("ALARME", "VOCAL", "LES_DEUX", name="canal_preference_enum"),
        default="LES_DEUX",
    )
    volume_alarme = Column(Integer, default=80)
    vitesse_vocale = Column(Integer, default=100)  # pourcentage, 100 = normal
    repeter_si_ignore = Column(Integer, default=1)  # 0 = non, 1 = oui (Boolean simplifie)
    delai_repetition_min = Column(Integer, default=5)

    utilisateur = relationship("Utilisateur", back_populates="preference_rappel")
