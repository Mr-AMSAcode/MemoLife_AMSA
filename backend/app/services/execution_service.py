# ─────────────────────────────────────────
# FICHIER : backend/app/services/execution_service.py
# Toute la LOGIQUE METIER reelle. Aucun appel a Qwen3 ici.
# C'est ce module qui cree les Taches, Roadmaps, SuiviPersonne
# une fois qu'une proposition a ete validee par l'utilisateur.
# ─────────────────────────────────────────
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.models.tache import Tache
from app.models.roadmap import Roadmap
from app.models.suivi_personne import SuiviPersonne
from app.models.rappel import Rappel
from app.models.proposition import PropositionIA


# ─────────────────────────────────────────
# Resolution de dates relatives
# Qwen3 renvoie "demain", "lundi prochain", etc. -- 
# c'est FastAPI qui calcule la vraie date, jamais l'IA.
# ─────────────────────────────────────────

JOURS_SEMAINE = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]


def resoudre_date_relative(date_relative: Optional[str], date_absolue: Optional[str]) -> datetime:
    """Convertit une expression temporelle en date reelle. Logique pure Python/FastAPI."""
    maintenant = datetime.now()

    if date_absolue:
        try:
            return datetime.strptime(date_absolue, "%Y-%m-%d")
        except ValueError:
            pass

    if not date_relative:
        return maintenant

    expr = date_relative.lower().strip()

    if expr in ("aujourd'hui", "aujourdhui"):
        return maintenant
    if expr == "demain":
        return maintenant + timedelta(days=1)
    if expr == "apres-demain" or expr == "après-demain":
        return maintenant + timedelta(days=2)

    for i, jour in enumerate(JOURS_SEMAINE):
        if jour in expr:
            jours_a_ajouter = (i - maintenant.weekday()) % 7
            if jours_a_ajouter == 0:
                jours_a_ajouter = 7  # "lundi" dit un lundi => le lundi suivant
            return maintenant + timedelta(days=jours_a_ajouter)

    return maintenant  # repli par defaut


def combiner_date_heure(date_obj: datetime, heure_str: Optional[str]) -> datetime:
    """Combine une date et une heure 'HH:MM' en un seul datetime."""
    if not heure_str:
        return date_obj.replace(hour=8, minute=0, second=0, microsecond=0)
    try:
        h, m = map(int, heure_str.split(":"))
        return date_obj.replace(hour=h, minute=m, second=0, microsecond=0)
    except (ValueError, AttributeError):
        return date_obj.replace(hour=8, minute=0, second=0, microsecond=0)


# ─────────────────────────────────────────
# Executants — un par type d'intention
# ─────────────────────────────────────────

def _executer_creer_tache(db: Session, utilisateur_id: str, donnees: dict) -> dict:
    date_calculee = resoudre_date_relative(
        donnees.get("date_relative"), donnees.get("date_absolue")
    )
    echeance = combiner_date_heure(date_calculee, donnees.get("heure"))

    tache = Tache(
        utilisateur_id=utilisateur_id,
        titre=donnees["titre"],
        description=donnees.get("description"),
        statut="A_FAIRE",
        priorite=donnees.get("priorite", "NORMALE"),
        date_echeance=echeance,
        source="IA",
    )
    db.add(tache)
    db.commit()
    db.refresh(tache)

    # Planifier le rappel (alarme + vocal simultanes, cf. PreferenceRappel)
    rappel = Rappel(
        tache_id=tache.id,
        planifie_a=echeance,
        texte_a_lire=f"{tache.titre}",
        canal="VOCAL_TEXTE",
        statut="PLANIFIE",
    )
    db.add(rappel)
    db.commit()

    return {"type": "Tache", "id": str(tache.id), "echeance": echeance.isoformat()}


def _executer_creer_roadmap(db: Session, utilisateur_id: str, donnees: dict) -> dict:
    duree_jours = donnees.get("duree_estimee_jours") or 30
    date_debut = datetime.now()
    date_fin = date_debut + timedelta(days=duree_jours)

    roadmap = Roadmap(
        utilisateur_id=utilisateur_id,
        titre=donnees["titre"],
        type=donnees["type"],
        date_debut=date_debut,
        date_fin=date_fin,
        progression_pct=0.0,
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    # Repartir les etapes suggerees sur la duree totale, a intervalles egaux
    etapes = donnees.get("etapes_suggerees", [])
    taches_creees = []
    if etapes:
        intervalle = duree_jours / len(etapes)
        for i, etape_titre in enumerate(etapes):
            echeance_etape = date_debut + timedelta(days=round(intervalle * (i + 1)))
            tache_etape = Tache(
                utilisateur_id=utilisateur_id,
                roadmap_id=roadmap.id,
                titre=etape_titre,
                statut="A_FAIRE",
                priorite="NORMALE",
                date_echeance=echeance_etape,
                source="IA",
            )
            db.add(tache_etape)
            taches_creees.append(tache_etape)
        db.commit()

    return {
        "type": "Roadmap",
        "id": str(roadmap.id),
        "nb_etapes": len(taches_creees),
    }


def _executer_enregistrer_suivi(db: Session, utilisateur_id: str, donnees: dict) -> dict:
    suivi = SuiviPersonne(
        utilisateur_id=utilisateur_id,
        date=datetime.now().date(),
        sante_etat=donnees.get("sante_etat"),
        humeur=donnees.get("humeur"),
        note_libre=donnees.get("note_libre"),
        presence_app=True,
        derniere_activite=datetime.now(),
    )
    db.add(suivi)
    db.commit()
    db.refresh(suivi)

    return {"type": "SuiviPersonne", "id": str(suivi.id)}


def _executer_modifier_tache(db: Session, utilisateur_id: str, donnees: dict) -> dict:
    # Recherche approximative par titre (logique simple, ameliorable plus tard)
    tache = (
        db.query(Tache)
        .filter(
            Tache.utilisateur_id == utilisateur_id,
            Tache.titre.ilike(f"%{donnees['tache_reference']}%"),
            Tache.statut == "A_FAIRE",
        )
        .order_by(Tache.date_echeance.asc())
        .first()
    )
    if tache is None:
        return {"type": "MODIFIER_TACHE", "erreur": "Tache introuvable"}

    if donnees.get("nouveau_titre"):
        tache.titre = donnees["nouveau_titre"]
    if donnees.get("nouvelle_priorite"):
        tache.priorite = donnees["nouvelle_priorite"]
    if donnees.get("nouvelle_date") or donnees.get("nouvelle_heure"):
        nouvelle_date = resoudre_date_relative(donnees.get("nouvelle_date"), None)
        tache.date_echeance = combiner_date_heure(nouvelle_date, donnees.get("nouvelle_heure"))

    db.commit()
    return {"type": "Tache", "id": str(tache.id), "statut": "modifiee"}


# ─────────────────────────────────────────
# Dispatcher principal
# ─────────────────────────────────────────

EXECUTANTS = {
    "CREER_TACHE": _executer_creer_tache,
    "CREER_ROADMAP": _executer_creer_roadmap,
    "ENREGISTRER_SUIVI": _executer_enregistrer_suivi,
    "MODIFIER_TACHE": _executer_modifier_tache,
}


def executer_proposition(db: Session, proposition: PropositionIA) -> dict:
    """
    Point d'entree unique appele depuis routes/chat.py APRES validation
    explicite de l'utilisateur. Aucune ecriture en base avant cet appel.
    """
    executant = EXECUTANTS.get(proposition.intention)
    if executant is None:
        return {"erreur": f"Aucun executant pour l'intention {proposition.intention}"}

    return executant(db, str(proposition.utilisateur_id), proposition.donnees)
