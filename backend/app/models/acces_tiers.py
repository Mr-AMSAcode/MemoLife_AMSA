# ─────────────────────────────────────────
# FICHIER : backend/app/models/acces_tiers.py
# ─────────────────────────────────────────
import uuid

from sqlalchemy import Column, String, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy import UUID

from app.db.database import Base


class AccesTiers(Base):
    __tablename__ = "acces_tiers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)

    tiers_nom = Column(String, nullable=False)
    tiers_contact = Column(String, nullable=False)
    niveau_acces = Column(SAEnum("LECTURE_SEULE", name="niveau_acces_enum"), default="LECTURE_SEULE")
    portee = Column(
        SAEnum("PLANNING", "SUIVI", "LES_DEUX", name="portee_acces_enum"),
        default="LES_DEUX",
    )
    actif = Column(Boolean, default=True)

    def revoquer(self):
        self.actif = False
