# ─────────────────────────────────────────
# FICHIER : backend/app/routes/chat.py
# Route HTTP qui orchestre : reception du message,
# appel au service IA, creation de la PropositionIA
# (jamais d'execution directe sans validation utilisateur).
# ─────────────────────────────────────────
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.ia_service import traiter_message_utilisateur
from app.schemas.ia_schemas import IntentionType
from app.models.message import Message
from app.models.proposition import PropositionIA
from app.models.memoire import MemoireComportementale
from app.auth.dependencies import get_utilisateur_courant
from typing import Optional

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/conversations")
def lister_conversations(
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Retourne une liste simple d'aperçus de conversations pour l'historique.
    Implémentation légère : on renvoie les derniers messages de l'utilisateur
    comme "conversations" (id, titre, nb_messages, updated_at).
    """
    messages = (
        db.query(Message)
        .filter(Message.utilisateur_id == utilisateur.id)
        .order_by(Message.created_at.desc())
        .limit(50)
        .all()
    )

    result = []
    for m in messages:
        titre = (m.contenu or "").strip()
        if len(titre) > 60:
            titre = titre[:57].rstrip() + "..."
        result.append({
            "id": str(m.id),
            "titre": titre or "Message sans contenu",
            "nb_messages": 1,
            "updated_at": m.created_at.isoformat(),
        })

    return result


@router.post("/message")
async def envoyer_message(
    payload: dict,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Recoit un message utilisateur (texte ou transcription vocale),
    le transmet a Qwen3, et cree une proposition en attente de validation.
    AUCUNE tache, roadmap ou suivi n'est cree directement ici --
    tout passe par /chat/proposition/{id}/valider.
    """
    contenu = payload.get("contenu", "").strip()
    if not contenu:
        raise HTTPException(status_code=400, detail="Message vide")

    # 1. Charger la memoire comportementale de l'utilisateur (PostgreSQL, pas Qwen3)
    memoire = (
        db.query(MemoireComportementale)
        .filter(MemoireComportementale.utilisateur_id == utilisateur.id)
        .order_by(MemoireComportementale.nb_occurrences.desc())
        .limit(5)
        .all()
    )
    memoire_dicts = [{"explication": m.explication} for m in memoire]

    # 2. Sauvegarder le message entrant
    message = Message(
        utilisateur_id=utilisateur.id,
        role="USER",
        contenu=contenu,
        type_media=payload.get("type_media", "TEXTE"),
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    # 3. Appeler Qwen3 (le seul rôle : comprendre + structurer)
    reponse_ia = await traiter_message_utilisateur(
        message_utilisateur=contenu,
        profil_utilisateur=utilisateur.profil,
        memoire_comportementale=memoire_dicts,
    )

    # 4. Enregistrer l'intention extraite sur le message (tracabilite)
    message.intention_extraite = reponse_ia.model_dump()
    db.commit()

    # 5. Cas CONSULTER : pas de proposition, juste une reponse informative
    if reponse_ia.intention == IntentionType.CONSULTER:
        return {
            "message_ia": reponse_ia.reponse_naturelle,
            "intention": reponse_ia.intention,
            "proposition": None,
        }

    # 6. Cas AMBIGU : on redemande une clarification, rien n'est cree
    if reponse_ia.intention == IntentionType.AMBIGU:
        return {
            "message_ia": reponse_ia.reponse_naturelle,
            "intention": reponse_ia.intention,
            "proposition": None,
        }

    # 7. Tous les autres cas : creer une PropositionIA EN_ATTENTE
    #    -> la veritable creation de Tache/Roadmap/SuiviPersonne se fait
    #       uniquement dans la route /valider, jamais ici.
    proposition = PropositionIA(
        message_id=message.id,
        utilisateur_id=utilisateur.id,
        intention=reponse_ia.intention,
        donnees=reponse_ia.donnees,
        statut="EN_ATTENTE",
    )
    db.add(proposition)
    db.commit()
    db.refresh(proposition)

    return {
        "message_ia": reponse_ia.reponse_naturelle,
        "intention": reponse_ia.intention,
        "proposition": {
            "id": str(proposition.id),
            "intention": proposition.intention,
            "donnees": proposition.donnees,
        },
    }


@router.post("/proposition/{proposition_id}/valider")
def valider_proposition(
    proposition_id: str,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Seul point d'entree qui transforme une proposition en donnee reelle
    (Tache, Roadmap, SuiviPersonne...). Avant cet appel, rien n'existe
    dans le planning de l'utilisateur.
    """
    proposition = (
        db.query(PropositionIA)
        .filter(
            PropositionIA.id == proposition_id,
            PropositionIA.utilisateur_id == utilisateur.id,
        )
        .first()
    )
    if proposition is None:
        raise HTTPException(status_code=404, detail="Proposition introuvable")
    if proposition.statut != "EN_ATTENTE":
        raise HTTPException(status_code=409, detail="Proposition deja traitee")

    # La creation reelle (Tache, Rappel, Roadmap...) est deleguee
    # a un service metier dedie -- PAS a Qwen3, conformement a la vision.
    from app.services.execution_service import executer_proposition
    resultat = executer_proposition(db, proposition)

    proposition.statut = "VALIDEE"
    db.commit()

    return {"statut": "VALIDEE", "resultat": resultat}


@router.post("/proposition/{proposition_id}/refuser")
def refuser_proposition(
    proposition_id: str,
    payload: Optional[dict] = None,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Refuse une proposition. Met a jour la memoire comportementale
    pour que Qwen3 (via le contexte injecte par FastAPI) propose
    differemment la prochaine fois -- l'apprentissage reste cote PostgreSQL.
    """
    proposition = (
        db.query(PropositionIA)
        .filter(
            PropositionIA.id == proposition_id,
            PropositionIA.utilisateur_id == utilisateur.id,
        )
        .first()
    )
    if proposition is None:
        raise HTTPException(status_code=404, detail="Proposition introuvable")

    proposition.statut = "REFUSEE"

    raison = (payload or {}).get("raison", "Non precisee")
    souvenir = MemoireComportementale(
        utilisateur_id=utilisateur.id,
        type="REFUS",
        valeur={"intention": proposition.intention, "raison": raison},
        explication=f"L'utilisateur a refuse une proposition de type {proposition.intention} ({raison}).",
        nb_occurrences=1,
    )
    db.add(souvenir)
    db.commit()

    return {"statut": "REFUSEE"}
