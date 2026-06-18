# ─────────────────────────────────────────
# FICHIER : backend/app/schemas/ia_schemas.py
# Contrat de donnees entre Qwen3 et FastAPI
# ─────────────────────────────────────────
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class IntentionType(str, Enum):
    """Les seules intentions que Qwen3 a le droit de produire."""
    CREER_TACHE = "CREER_TACHE"
    CREER_ROADMAP = "CREER_ROADMAP"
    ENREGISTRER_SUIVI = "ENREGISTRER_SUIVI"
    MODIFIER_TACHE = "MODIFIER_TACHE"
    CONSULTER = "CONSULTER"
    AMBIGU = "AMBIGU"


class Priorite(str, Enum):
    BASSE = "BASSE"
    NORMALE = "NORMALE"
    HAUTE = "HAUTE"


class TypeRoadmap(str, Enum):
    FORMATION = "FORMATION"
    PROJET = "PROJET"


class Humeur(str, Enum):
    JOYEUX = "JOYEUX"
    NEUTRE = "NEUTRE"
    TRISTE = "TRISTE"
    STRESSE = "STRESSE"


class SanteEtat(str, Enum):
    BIEN = "BIEN"
    MOYEN = "MOYEN"
    MAUVAIS = "MAUVAIS"


# ─────────────────────────────────────────
# Sous-structures "donnees" — une par intention
# ─────────────────────────────────────────

class DonneesCreerTache(BaseModel):
    titre: str
    description: Optional[str] = None
    date_relative: Optional[str] = None   # ex: "demain", "lundi prochain"
    date_absolue: Optional[str] = None     # ex: "2026-06-20" si Qwen a pu la deduire
    heure: Optional[str] = None            # format "HH:MM"
    priorite: Priorite = Priorite.NORMALE


class DonneesCreerRoadmap(BaseModel):
    titre: str
    type: TypeRoadmap
    duree_estimee_jours: Optional[int] = None
    etapes_suggerees: List[str] = Field(default_factory=list)


class DonneesEnregistrerSuivi(BaseModel):
    humeur: Optional[Humeur] = None
    sante_etat: Optional[SanteEtat] = None
    note_libre: Optional[str] = None


class DonneesModifierTache(BaseModel):
    tache_reference: str          # description permettant de retrouver la tache (titre approximatif)
    nouvelle_date: Optional[str] = None
    nouvelle_heure: Optional[str] = None
    nouveau_titre: Optional[str] = None
    nouvelle_priorite: Optional[Priorite] = None


class DonneesConsulter(BaseModel):
    portee: str = "AUJOURDHUI"    # ex: AUJOURDHUI, SEMAINE, ROADMAP, SUIVI


class DonneesAmbigu(BaseModel):
    raison: str
    question_clarification: str


# ─────────────────────────────────────────
# Enveloppe generale — CE QUE QWEN3 DOIT RENVOYER
# ─────────────────────────────────────────

class ReponseQwen(BaseModel):
    """
    Structure unique que Qwen3 doit produire pour CHAQUE message utilisateur.
    Le champ 'donnees' reste un dict libre a ce niveau ; il est requalifie
    dans le bon sous-schema par le service ia_service.py selon 'intention'.
    """
    intention: IntentionType
    confiance: float = Field(ge=0.0, le=1.0)
    donnees: dict
    reponse_naturelle: str

    @field_validator("confiance")
    @classmethod
    def arrondir_confiance(cls, v: float) -> float:
        return round(v, 2)


# Mapping intention -> schema de validation des "donnees"
SCHEMA_PAR_INTENTION = {
    IntentionType.CREER_TACHE: DonneesCreerTache,
    IntentionType.CREER_ROADMAP: DonneesCreerRoadmap,
    IntentionType.ENREGISTRER_SUIVI: DonneesEnregistrerSuivi,
    IntentionType.MODIFIER_TACHE: DonneesModifierTache,
    IntentionType.CONSULTER: DonneesConsulter,
    IntentionType.AMBIGU: DonneesAmbigu,
}
