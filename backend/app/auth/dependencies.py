# ─────────────────────────────────────────
# FICHIER : backend/app/auth/dependencies.py
# ─────────────────────────────────────────
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.security import decoder_access_token
from app.models.utilisateur import Utilisateur

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_utilisateur_courant(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Utilisateur:
    erreur_auth = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants invalides ou expires",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decoder_access_token(token)
    if payload is None:
        raise erreur_auth

    utilisateur_id = payload.get("sub")
    if utilisateur_id is None:
        raise erreur_auth

    utilisateur = db.query(Utilisateur).filter(Utilisateur.id == utilisateur_id).first()
    if utilisateur is None:
        raise erreur_auth

    return utilisateur
