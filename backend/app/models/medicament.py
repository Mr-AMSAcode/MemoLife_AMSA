# ─────────────────────────────────────────
# FICHIER : backend/app/models/medicament.py
# ─────────────────────────────────────────
import uuid
from datetime import datetime, date as date_type

from sqlalchemy import Column, String, Date, DateTime, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy import UUID
from sqlalchemy import JSON
from datetime import time as time_type
from sqlalchemy.orm import relationship

from app.db.database import Base


class Medicament(Base):
    __tablename__ = "medicaments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)

    nom = Column(String, nullable=False)
    dosage = Column(String, nullable=True)
    frequence = Column(
        SAEnum("QUOTIDIEN", "BIQUOTIDIEN", "HEBDO", name="frequence_medicament_enum"),
        default="QUOTIDIEN",
    )
    heures_prise = Column(JSON, default=list)
    date_debut = Column(Date, default=date_type.today)
    date_fin = Column(Date, nullable=True)
    actif = Column(Boolean, default=True)

    prises = relationship("PriseMedicament", back_populates="medicament", cascade="all, delete-orphan")


class PriseMedicament(Base):
    __tablename__ = "prises_medicament"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medicament_id = Column(UUID(as_uuid=True), ForeignKey("medicaments.id"), nullable=False)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)

    prise_a = Column(DateTime, default=datetime.utcnow)
    statut = Column(
        SAEnum("PRISE", "OUBLIEE", "REPORTEE", name="statut_prise_enum"),
        default="PRISE",
    )

    medicament = relationship("Medicament", back_populates="prises")
