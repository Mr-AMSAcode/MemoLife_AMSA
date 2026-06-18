# ─────────────────────────────────────────
# FICHIER : backend/app/routes/sante.py
# Medicaments + SuiviPersonne (sante, humeur, presence)
# ─────────────────────────────────────────
from datetime import datetime, date as date_type, time as time_type
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.models.medicament import Medicament, PriseMedicament
from app.models.suivi_personne import SuiviPersonne
from app.models.utilisateur import Utilisateur
from app.auth.dependencies import get_utilisateur_courant

router = APIRouter(prefix="/sante", tags=["sante"])


# ───────── Médicaments ─────────

class MedicamentCreate(BaseModel):
    nom: str
    dosage: Optional[str] = None
    frequence: str = "QUOTIDIEN"
    heures_prise: list[str] = []  # ex: ["08:00", "20:00"]


def _serialiser_medicament(m: Medicament) -> dict:
    return {
        "id": str(m.id),
        "nom": m.nom,
        "dosage": m.dosage,
        "frequence": m.frequence,
        "heures_prise": [h.strftime("%H:%M") for h in (m.heures_prise or [])],
        "actif": m.actif,
    }


@router.get("/medicaments")
def lister_medicaments(
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    meds = db.query(Medicament).filter(Medicament.utilisateur_id == utilisateur.id).all()
    return [_serialiser_medicament(m) for m in meds]


@router.post("/medicaments")
def creer_medicament(
    payload: MedicamentCreate,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    heures = []
    for h in payload.heures_prise:
        try:
            hh, mm = map(int, h.split(":"))
            heures.append(time_type(hh, mm))
        except ValueError:
            continue

    medicament = Medicament(
        utilisateur_id=utilisateur.id,
        nom=payload.nom,
        dosage=payload.dosage,
        frequence=payload.frequence,
        heures_prise=heures,
        date_debut=date_type.today(),
        actif=True,
    )
    db.add(medicament)
    db.commit()
    db.refresh(medicament)
    return _serialiser_medicament(medicament)


@router.put("/medicaments/{medicament_id}")
def modifier_medicament(
    medicament_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    medicament = (
        db.query(Medicament)
        .filter(Medicament.id == medicament_id, Medicament.utilisateur_id == utilisateur.id)
        .first()
    )
    if not medicament:
        raise HTTPException(404, "Medicament introuvable")
    if "actif" in payload:
        medicament.actif = payload["actif"]
    db.commit()
    return _serialiser_medicament(medicament)


@router.delete("/medicaments/{medicament_id}")
def supprimer_medicament(
    medicament_id: str,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    medicament = (
        db.query(Medicament)
        .filter(Medicament.id == medicament_id, Medicament.utilisateur_id == utilisateur.id)
        .first()
    )
    if not medicament:
        raise HTTPException(404, "Medicament introuvable")
    db.delete(medicament)
    db.commit()
    return {"statut": "supprime"}


@router.post("/medicaments/{medicament_id}/prise")
def confirmer_prise(
    medicament_id: str,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    medicament = (
        db.query(Medicament)
        .filter(Medicament.id == medicament_id, Medicament.utilisateur_id == utilisateur.id)
        .first()
    )
    if not medicament:
        raise HTTPException(404, "Medicament introuvable")

    prise = PriseMedicament(
        medicament_id=medicament.id,
        utilisateur_id=utilisateur.id,
        prise_a=datetime.utcnow(),
        statut="PRISE",
    )
    db.add(prise)
    db.commit()
    return {"statut": "prise enregistree"}


# ───────── Suivi de la personne ─────────

class SuiviCreate(BaseModel):
    sante_etat: Optional[str] = None
    humeur: Optional[str] = None
    note_libre: Optional[str] = None


@router.post("/suivi")
def enregistrer_suivi(
    payload: SuiviCreate,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    suivi = SuiviPersonne(
        utilisateur_id=utilisateur.id,
        date=date_type.today(),
        sante_etat=payload.sante_etat,
        humeur=payload.humeur,
        note_libre=payload.note_libre,
        presence_app=True,
        derniere_activite=datetime.utcnow(),
    )
    db.add(suivi)
    db.commit()
    db.refresh(suivi)
    return {"id": str(suivi.id), "statut": "enregistre"}


@router.get("/suivi/historique")
def historique_suivi(
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    suivis = (
        db.query(SuiviPersonne)
        .filter(SuiviPersonne.utilisateur_id == utilisateur.id)
        .order_by(SuiviPersonne.date.desc())
        .limit(30)
        .all()
    )
    return [
        {
            "id": str(s.id),
            "date": s.date.isoformat(),
            "sante_etat": s.sante_etat,
            "humeur": s.humeur,
            "note_libre": s.note_libre,
        }
        for s in suivis
    ]
