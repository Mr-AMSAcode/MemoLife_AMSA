# ─────────────────────────────────────────
# FICHIER : backend/app/models/budget.py
# ─────────────────────────────────────────
import uuid
from datetime import datetime, date as date_type

from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)

    mois = Column(Date, default=date_type.today)  # on stocke le 1er jour du mois concerne
    plafond_fcfa = Column(Integer, default=0)
    alerte_seuil_pct = Column(Integer, default=80)

    depenses = relationship("Depense", back_populates="budget", cascade="all, delete-orphan")

    def depense_totale(self) -> int:
        return sum(d.montant_fcfa for d in self.depenses)

    def solde_restant(self) -> int:
        return self.plafond_fcfa - self.depense_totale()

    def est_depasse(self) -> bool:
        if self.plafond_fcfa == 0:
            return False
        return (self.depense_totale() / self.plafond_fcfa) * 100 >= self.alerte_seuil_pct


class Depense(Base):
    __tablename__ = "depenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    budget_id = Column(UUID(as_uuid=True), ForeignKey("budgets.id"), nullable=False)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)

    libelle = Column(String, nullable=False)
    montant_fcfa = Column(Integer, nullable=False)
    categorie = Column(
        SAEnum(
            "ALIMENTAIRE", "TRANSPORT", "SANTE", "EDUCATION", "LOISIR", "AUTRE",
            name="categorie_depense_enum",
        ),
        default="AUTRE",
    )
    date = Column(DateTime, default=datetime.utcnow)
    source = Column(SAEnum("MANUELLE", "IA", name="source_depense_enum"), default="MANUELLE")

    budget = relationship("Budget", back_populates="depenses")
