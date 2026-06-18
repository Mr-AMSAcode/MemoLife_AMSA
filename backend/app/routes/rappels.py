# ─────────────────────────────────────────
# FICHIER : backend/app/routes/rappels.py
# Declenche un rappel : cree l'alarme sonore ET la
# lecture vocale (Piper TTS) en meme temps, conformement
# a la decision "vocal + texte affiches en meme temps".
# ─────────────────────────────────────────
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.rappel import Rappel, PreferenceRappel
from app.models.lecture_vocale import LectureVocale, AlarmeSonore
from app.models.utilisateur import Utilisateur
from app.services.tts_service import generer_audio
from app.auth.dependencies import get_utilisateur_courant

router = APIRouter(prefix="/rappels", tags=["rappels"])


@router.get("/a-venir")
def rappels_a_venir(
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    """Liste les rappels planifies dans les prochaines 24h pour cet utilisateur."""
    maintenant = datetime.utcnow()
    horizon = maintenant + timedelta(hours=24)

    rappels = (
        db.query(Rappel)
        .join(Rappel.tache)
        .filter(
            Rappel.tache.has(utilisateur_id=utilisateur.id),
            Rappel.planifie_a >= maintenant,
            Rappel.planifie_a <= horizon,
            Rappel.statut == "PLANIFIE",
        )
        .all()
    )

    return [
        {
            "id": str(r.id),
            "tache_id": str(r.tache_id),
            "planifie_a": r.planifie_a.isoformat(),
            "texte_a_lire": r.texte_a_lire,
            "canal": r.canal,
        }
        for r in rappels
    ]


@router.post("/{rappel_id}/declencher")
def declencher_rappel(
    rappel_id: str,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    """
    Declenche reellement un rappel : genere l'audio via Piper (si le canal
    inclut le vocal) et cree l'enregistrement d'alarme sonore correspondant.
    Le frontend recupere ensuite l'URL audio et joue le son d'alarme.
    """
    rappel = (
        db.query(Rappel)
        .join(Rappel.tache)
        .filter(Rappel.id == rappel_id, Rappel.tache.has(utilisateur_id=utilisateur.id))
        .first()
    )
    if not rappel:
        raise HTTPException(404, "Rappel introuvable")

    preference = (
        db.query(PreferenceRappel)
        .filter(PreferenceRappel.utilisateur_id == utilisateur.id)
        .first()
    )
    langue = utilisateur.langue or "FR"

    audio_url = None
    if rappel.canal in ("VOCAL", "VOCAL_TEXTE"):
        audio_url = generer_audio(rappel.texte_a_lire, langue=langue)

        lecture = LectureVocale(
            rappel_id=rappel.id,
            audio_genere_url=audio_url,
            langue=langue,
        )
        db.add(lecture)

    alarme = AlarmeSonore(
        rappel_id=rappel.id,
        son="default",
        duree_sec=10,
    )
    db.add(alarme)

    rappel.declencher()
    db.commit()

    return {
        "statut": "declenche",
        "texte_a_lire": rappel.texte_a_lire,
        "audio_url": audio_url,
        "volume_alarme": preference.volume_alarme if preference else 80,
        "vitesse_vocale": preference.vitesse_vocale if preference else 100,
    }


@router.post("/{rappel_id}/confirmer")
def confirmer_rappel(
    rappel_id: str,
    db: Session = Depends(get_db),
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
):
    """L'utilisateur confirme avoir vu/entendu le rappel -- stoppe la repetition."""
    rappel = (
        db.query(Rappel)
        .join(Rappel.tache)
        .filter(Rappel.id == rappel_id, Rappel.tache.has(utilisateur_id=utilisateur.id))
        .first()
    )
    if not rappel:
        raise HTTPException(404, "Rappel introuvable")

    rappel.statut = "CONFIRME"
    db.commit()
    return {"statut": "CONFIRME"}
