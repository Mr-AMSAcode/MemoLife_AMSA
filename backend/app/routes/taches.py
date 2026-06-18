# ─────────────────────────────────────────
# FICHIER : backend/app/routes/taches.py
# ─────────────────────────────────────────
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.models.tache import Tache
from app.models.utilisateur import Utilisateur
from app.auth.dependencies import get_utilisateur_courant

router = APIRouter(prefix="/taches", tags=["taches"])


class TacheCreate(BaseModel):
    titre: str
    description: Optional[str] = None
    priorite: str = "NORMALE"
    date_echeance: Optional[datetime] = None


class TacheUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    priorite: Optional[str] = None
    date_echeance: Optional[datetime] = None
    statut: Optional[str] = None


def _serialiser(t: Tache) -> dict:
    return {
        "id": str(t.id),
        "titre": t.titre,
        "description": t.description,
        "statut": t.statut,
        "priorite": t.priorite,
        "date_echeance": t.date_echeance.isoformat() if t.date_echeance else None,
        "source": t.source,
        "roadmap_id": str(t.roadmap_id) if t.roadmap_id else None,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }


@router.get("")
def lister_taches(
    statut: Optional[str] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    query = db.query(Tache).filter(Tache.utilisateur_id == utilisateur.id)
    if statut:
        query = query.filter(Tache.statut == statut)
    if date:
        try:
            jour = datetime.strptime(date, "%Y-%m-%d").date()
            query = query.filter(
                Tache.date_echeance >= datetime.combine(jour, datetime.min.time()),
                Tache.date_echeance < datetime.combine(jour, datetime.max.time()),
            )
        except ValueError:
            pass

    taches = query.order_by(Tache.date_echeance.asc().nullslast()).all()
    return [_serialiser(t) for t in taches]


@router.post("")
def creer_tache(
    payload: TacheCreate,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    tache = Tache(
        utilisateur_id=utilisateur.id,
        titre=payload.titre,
        description=payload.description,
        priorite=payload.priorite,
        date_echeance=payload.date_echeance,
        source="MANUELLE",
        statut="A_FAIRE",
    )
    db.add(tache)
    db.commit()
    db.refresh(tache)
    return _serialiser(tache)


@router.put("/{tache_id}")
def modifier_tache(
    tache_id: str,
    payload: TacheUpdate,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    tache = db.query(Tache).filter(Tache.id == tache_id, Tache.utilisateur_id == utilisateur.id).first()
    if not tache:
        raise HTTPException(404, "Tache introuvable")

    for champ, valeur in payload.model_dump(exclude_unset=True).items():
        setattr(tache, champ, valeur)
    db.commit()
    db.refresh(tache)
    return _serialiser(tache)


@router.post("/{tache_id}/achever")
def achever_tache(
    tache_id: str,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    tache = db.query(Tache).filter(Tache.id == tache_id, Tache.utilisateur_id == utilisateur.id).first()
    if not tache:
        raise HTTPException(404, "Tache introuvable")
    tache.marquer_faite()
    db.commit()
    return _serialiser(tache)


@router.post("/{tache_id}/reporter")
def reporter_tache(
    tache_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    tache = db.query(Tache).filter(Tache.id == tache_id, Tache.utilisateur_id == utilisateur.id).first()
    if not tache:
        raise HTTPException(404, "Tache introuvable")
    nouvelle_date = datetime.fromisoformat(payload["nouvelle_date"])
    tache.reporter(nouvelle_date)
    db.commit()
    return _serialiser(tache)


@router.delete("/{tache_id}")
def supprimer_tache(
    tache_id: str,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    tache = db.query(Tache).filter(Tache.id == tache_id, Tache.utilisateur_id == utilisateur.id).first()
    if not tache:
        raise HTTPException(404, "Tache introuvable")
    db.delete(tache)
    db.commit()
    return {"statut": "supprimee"}
