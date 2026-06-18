# ─────────────────────────────────────────
# FICHIER : backend/app/routes/budget.py
# ─────────────────────────────────────────
from datetime import datetime, date as date_type
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.models.budget import Budget, Depense
from app.models.utilisateur import Utilisateur
from app.auth.dependencies import get_utilisateur_courant

router = APIRouter(prefix="/budget", tags=["budget"])


class BudgetCreate(BaseModel):
    plafond_fcfa: int
    alerte_seuil_pct: int = 80


class DepenseCreate(BaseModel):
    libelle: str
    montant_fcfa: int
    categorie: str = "AUTRE"


def _premier_jour_du_mois(mois_str: Optional[str] = None) -> date_type:
    if mois_str:
        try:
            return datetime.strptime(mois_str, "%Y-%m").date().replace(day=1)
        except ValueError:
            pass
    return date_type.today().replace(day=1)


def _serialiser_budget(b: Budget) -> dict:
    return {
        "id": str(b.id),
        "mois": b.mois.isoformat(),
        "plafond_fcfa": b.plafond_fcfa,
        "depense_totale": b.depense_totale(),
        "solde_restant": b.solde_restant(),
        "alerte_seuil_pct": b.alerte_seuil_pct,
        "est_depasse": b.est_depasse(),
    }


@router.get("/current")
def obtenir_budget_courant(
    mois: Optional[str] = None,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    mois_cible = _premier_jour_du_mois(mois)
    budget = (
        db.query(Budget)
        .filter(Budget.utilisateur_id == utilisateur.id, Budget.mois == mois_cible)
        .first()
    )
    if not budget:
        raise HTTPException(404, "Aucun budget defini pour ce mois")
    return _serialiser_budget(budget)


@router.post("")
def creer_ou_maj_budget(
    payload: BudgetCreate,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    mois_cible = date_type.today().replace(day=1)
    budget = (
        db.query(Budget)
        .filter(Budget.utilisateur_id == utilisateur.id, Budget.mois == mois_cible)
        .first()
    )
    if budget:
        budget.plafond_fcfa = payload.plafond_fcfa
        budget.alerte_seuil_pct = payload.alerte_seuil_pct
    else:
        budget = Budget(
            utilisateur_id=utilisateur.id,
            mois=mois_cible,
            plafond_fcfa=payload.plafond_fcfa,
            alerte_seuil_pct=payload.alerte_seuil_pct,
        )
        db.add(budget)

    db.commit()
    db.refresh(budget)
    return _serialiser_budget(budget)


@router.get("/depenses")
def lister_depenses(
    mois: Optional[str] = None,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    mois_cible = _premier_jour_du_mois(mois)
    budget = (
        db.query(Budget)
        .filter(Budget.utilisateur_id == utilisateur.id, Budget.mois == mois_cible)
        .first()
    )
    if not budget:
        return []

    return [
        {
            "id": str(d.id),
            "libelle": d.libelle,
            "montant_fcfa": d.montant_fcfa,
            "categorie": d.categorie,
            "date": d.date.isoformat(),
            "source": d.source,
        }
        for d in sorted(budget.depenses, key=lambda x: x.date, reverse=True)
    ]


@router.post("/depenses")
def ajouter_depense(
    payload: DepenseCreate,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    mois_cible = date_type.today().replace(day=1)
    budget = (
        db.query(Budget)
        .filter(Budget.utilisateur_id == utilisateur.id, Budget.mois == mois_cible)
        .first()
    )
    if not budget:
        # Cree un budget par defaut a 0 si aucun n'existe encore
        budget = Budget(utilisateur_id=utilisateur.id, mois=mois_cible, plafond_fcfa=0)
        db.add(budget)
        db.commit()
        db.refresh(budget)

    depense = Depense(
        budget_id=budget.id,
        utilisateur_id=utilisateur.id,
        libelle=payload.libelle,
        montant_fcfa=payload.montant_fcfa,
        categorie=payload.categorie,
        source="MANUELLE",
    )
    db.add(depense)
    db.commit()
    db.refresh(depense)

    return {
        "id": str(depense.id),
        "libelle": depense.libelle,
        "montant_fcfa": depense.montant_fcfa,
        "categorie": depense.categorie,
        "date": depense.date.isoformat(),
    }


@router.delete("/depenses/{depense_id}")
def supprimer_depense(
    depense_id: str,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    depense = (
        db.query(Depense)
        .filter(Depense.id == depense_id, Depense.utilisateur_id == utilisateur.id)
        .first()
    )
    if not depense:
        raise HTTPException(404, "Depense introuvable")
    db.delete(depense)
    db.commit()
    return {"statut": "supprimee"}
