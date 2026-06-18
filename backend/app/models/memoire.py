# ─────────────────────────────────────────
# FICHIER : backend/app/models/memoire.py
# ─────────────────────────────────────────
import uuid
from datetime import datetime

from sqlalchemy import Column, Text, Integer, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy import UUID
from sqlalchemy import JSON

from app.db.database import Base


class MemoireComportementale(Base):
    __tablename__ = "memoire_comportementale"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)

    type = Column(
        SAEnum("HORAIRE", "FREQUENCE", "REFUS", name="type_memoire_enum"),
        nullable=False,
    )
    valeur = Column(JSON, nullable=False)
    explication = Column(Text, nullable=False)
    nb_occurrences = Column(Integer, default=1)
    derniere_maj = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def mettre_a_jour(self):
        self.nb_occurrences += 1
        self.derniere_maj = datetime.utcnow()
