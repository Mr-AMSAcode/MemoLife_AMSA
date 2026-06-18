# ─────────────────────────────────────────
# FICHIER : backend/app/models/__init__.py
# Regroupe tous les modeles pour que SQLAlchemy
# resolve correctement les relations entre tables.
# ─────────────────────────────────────────
from app.models.utilisateur import Utilisateur
from app.models.tache import Tache
from app.models.roadmap import Roadmap
from app.models.rappel import Rappel, PreferenceRappel
from app.models.suivi_personne import SuiviPersonne
from app.models.message import Message
from app.models.proposition import PropositionIA
from app.models.memoire import MemoireComportementale
from app.models.acces_tiers import AccesTiers
from app.models.medicament import Medicament, PriseMedicament
from app.models.budget import Budget, Depense
from app.models.lecture_vocale import LectureVocale, AlarmeSonore

__all__ = [
    "Utilisateur",
    "Tache",
    "Roadmap",
    "Rappel",
    "PreferenceRappel",
    "SuiviPersonne",
    "Message",
    "PropositionIA",
    "MemoireComportementale",
    "AccesTiers",
    "Medicament",
    "PriseMedicament",
    "Budget",
    "Depense",
    "LectureVocale",
    "AlarmeSonore",
]
