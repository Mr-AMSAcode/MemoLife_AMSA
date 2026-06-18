# ─────────────────────────────────────────
# FICHIER : backend/app/models/message.py
# ─────────────────────────────────────────
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy import UUID
from sqlalchemy import JSON
from sqlalchemy.orm import relationship

from app.db.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)

    role = Column(SAEnum("USER", "ASSISTANT", name="role_message_enum"), default="USER")
    contenu = Column(Text, nullable=False)
    type_media = Column(SAEnum("TEXTE", "VOCAL", name="type_media_enum"), default="TEXTE")
    intention_extraite = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    utilisateur = relationship("Utilisateur", back_populates="messages")
