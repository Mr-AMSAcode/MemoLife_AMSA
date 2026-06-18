# ─────────────────────────────────────────
# FICHIER : backend/app/models/utilisateur.py
# ─────────────────────────────────────────
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum, Time
from sqlalchemy import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom = Column(String, nullable=True)
    prenom = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=True, index=True)
    telephone = Column(String, unique=True, nullable=True, index=True)
    mot_de_passe_hash = Column(String, nullable=False)

    profil = Column(
        SAEnum("PERSONNE_AGEE", "ETUDIANT", "TRAVAILLEUR", name="profil_enum"),
        default="ETUDIANT",
    )
    langue = Column(SAEnum("FR", "EN", name="langue_enum"), default="FR")
    niveau_digital = Column(
        SAEnum("FAIBLE", "MOYEN", "AVANCE", name="niveau_digital_enum"),
        default="MOYEN",
    )
    heure_reveil = Column(Time, nullable=True)
    autorise_tiers = Column(Boolean, default=False)
    onboarding_ok = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    taches = relationship("Tache", back_populates="utilisateur", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="utilisateur", cascade="all, delete-orphan")
    preference_rappel = relationship("PreferenceRappel", back_populates="utilisateur", uselist=False, cascade="all, delete-orphan")
