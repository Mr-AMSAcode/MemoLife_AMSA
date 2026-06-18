# ─────────────────────────────────────────
# FICHIER : backend/app/models/suivi_personne.py
# ─────────────────────────────────────────
import uuid
from datetime import datetime, date as date_type

from sqlalchemy import Column, String, Text, Date, DateTime, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy import UUID

from app.db.database import Base


class SuiviPersonne(Base):
    __tablename__ = "suivi_personne"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)

    date = Column(Date, default=date_type.today)
    sante_etat = Column(SAEnum("BIEN", "MOYEN", "MAUVAIS", name="sante_etat_enum"), nullable=True)
    humeur = Column(SAEnum("JOYEUX", "NEUTRE", "TRISTE", "STRESSE", name="humeur_enum"), nullable=True)
    presence_app = Column(Boolean, default=True)
    derniere_activite = Column(DateTime, default=datetime.utcnow)
    note_libre = Column(Text, nullable=True)
