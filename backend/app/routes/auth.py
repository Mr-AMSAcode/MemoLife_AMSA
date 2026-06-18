# ─────────────────────────────────────────
# FICHIER : backend/app/routes/auth.py
# ─────────────────────────────────────────
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.db.database import get_db
from app.models.utilisateur import Utilisateur
from app.models.rappel import PreferenceRappel
from app.auth.security import hacher_mot_de_passe, verifier_mot_de_passe, creer_access_token
from app.auth.dependencies import get_utilisateur_courant

router = APIRouter(prefix="/auth", tags=["auth"])


class InscriptionPayload(BaseModel):
    nom: str
    prenom: str
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    mot_de_passe: str
    langue: str = "FR"


class OnboardingPayload(BaseModel):
    profil: str
    occupations: list[str] = []
    heure_reveil: str = "07:00"
    langue: str = "FR"


@router.post("/register")
def inscription(payload: InscriptionPayload, db: Session = Depends(get_db)):
    if not payload.email and not payload.telephone:
        raise HTTPException(400, "Email ou telephone requis")

    existe = None
    if payload.email:
        existe = db.query(Utilisateur).filter(Utilisateur.email == payload.email).first()
    if not existe and payload.telephone:
        existe = db.query(Utilisateur).filter(Utilisateur.telephone == payload.telephone).first()
    if existe:
        raise HTTPException(409, "Un compte existe deja avec cet email ou ce telephone")

    utilisateur = Utilisateur(
        nom=payload.nom,
        prenom=payload.prenom,
        email=payload.email,
        telephone=payload.telephone,
        mot_de_passe_hash=hacher_mot_de_passe(payload.mot_de_passe),
        langue=payload.langue,
    )
    db.add(utilisateur)
    db.commit()
    db.refresh(utilisateur)

    # Préférences de rappel par défaut (alarme + vocal simultanés)
    pref = PreferenceRappel(utilisateur_id=utilisateur.id)
    db.add(pref)
    db.commit()

    token = creer_access_token({"sub": str(utilisateur.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login")
def connexion(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    form_data.username contient l'email OU le telephone (cote frontend,
    on envoie l'un ou l'autre dans ce champ standard OAuth2).
    """
    identifiant = form_data.username
    utilisateur = (
        db.query(Utilisateur)
        .filter(
            (Utilisateur.email == identifiant) | (Utilisateur.telephone == identifiant)
        )
        .first()
    )

    if not utilisateur or not verifier_mot_de_passe(form_data.password, utilisateur.mot_de_passe_hash):
        raise HTTPException(401, "Email/telephone ou mot de passe incorrect")

    token = creer_access_token({"sub": str(utilisateur.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def profil_courant(utilisateur: Utilisateur = Depends(get_utilisateur_courant)):
    return {
        "id": str(utilisateur.id),
        "nom": utilisateur.nom,
        "prenom": utilisateur.prenom,
        "email": utilisateur.email,
        "telephone": utilisateur.telephone,
        "profil": utilisateur.profil,
        "langue": utilisateur.langue,
        "onboarding_ok": utilisateur.onboarding_ok,
        "plan": "FREE",
    }


@router.post("/onboarding")
def completer_onboarding(
    payload: OnboardingPayload,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    utilisateur.profil = payload.profil
    utilisateur.langue = payload.langue
    utilisateur.onboarding_ok = True

    try:
        h, m = map(int, payload.heure_reveil.split(":"))
        from datetime import time
        utilisateur.heure_reveil = time(h, m)
    except (ValueError, AttributeError):
        pass

    db.commit()
    return {"statut": "onboarding termine"}
