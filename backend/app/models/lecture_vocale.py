# ─────────────────────────────────────────
# FICHIER : backend/app/models/lecture_vocale.py
# ─────────────────────────────────────────
import uuid

from sqlalchemy import Column, String, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy import UUID

from app.db.database import Base


class LectureVocale(Base):
    __tablename__ = "lectures_vocales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rappel_id = Column(UUID(as_uuid=True), ForeignKey("rappels.id"), nullable=False)

    audio_genere_url = Column(String, nullable=True)
    langue = Column(SAEnum("FR", "EN", name="langue_vocale_enum"), default="FR")


class AlarmeSonore(Base):
    __tablename__ = "alarmes_sonores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rappel_id = Column(UUID(as_uuid=True), ForeignKey("rappels.id"), nullable=False)

    son = Column(String, default="default")
    duree_sec = Column(Integer, default=10)
