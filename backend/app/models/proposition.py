# ─────────────────────────────────────────
# FICHIER : backend/app/models/proposition.py
# ─────────────────────────────────────────
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Enum as SAEnum, JSON
from sqlalchemy import UUID

from app.db.database import Base


class PropositionIA(Base):
    __tablename__ = "propositions_ia"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id"), nullable=False)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)

    intention = Column(
        SAEnum(
            "CREER_TACHE", "CREER_ROADMAP", "ENREGISTRER_SUIVI",
            "MODIFIER_TACHE", "CONSULTER", "AMBIGU",
            name="intention_enum",
        ),
        nullable=False,
    )
    donnees = Column(JSON, nullable=False)
    statut = Column(
        SAEnum("EN_ATTENTE", "VALIDEE", "REFUSEE", name="statut_proposition_enum"),
        default="EN_ATTENTE",
    )
    created_at = Column(DateTime, default=datetime.utcnow)
