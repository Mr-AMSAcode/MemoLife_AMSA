# ─────────────────────────────────────────
# FICHIER : backend/app/routes/roadmap.py
# ─────────────────────────────────────────
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.roadmap import Roadmap
from app.models.tache import Tache
from app.models.utilisateur import Utilisateur
from app.auth.dependencies import get_utilisateur_courant

router = APIRouter(prefix="/roadmaps", tags=["roadmaps"])


def _serialiser(r: Roadmap) -> dict:
    return {
        "id": str(r.id),
        "titre": r.titre,
        "type": r.type,
        "date_debut": r.date_debut.isoformat() if r.date_debut else None,
        "date_fin": r.date_fin.isoformat() if r.date_fin else None,
        "progression_pct": r.calculer_progression(),
        "nb_etapes": len(r.taches),
        "nb_etapes_faites": sum(1 for t in r.taches if t.statut == "FAITE"),
    }


@router.get("")
def lister_roadmaps(
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    roadmaps = db.query(Roadmap).filter(Roadmap.utilisateur_id == utilisateur.id).all()
    return [_serialiser(r) for r in roadmaps]


@router.get("/{roadmap_id}")
def detail_roadmap(
    roadmap_id: str,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.id == roadmap_id, Roadmap.utilisateur_id == utilisateur.id)
        .first()
    )
    if not roadmap:
        raise HTTPException(404, "Roadmap introuvable")

    detail = _serialiser(roadmap)
    detail["etapes"] = [
        {
            "id": str(t.id),
            "titre": t.titre,
            "statut": t.statut,
            "date_echeance": t.date_echeance.isoformat() if t.date_echeance else None,
        }
        for t in sorted(roadmap.taches, key=lambda x: x.date_echeance or "")
    ]
    return detail
