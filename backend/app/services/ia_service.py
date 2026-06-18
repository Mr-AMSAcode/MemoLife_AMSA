# ─────────────────────────────────────────
# FICHIER : backend/app/services/ia_service.py
# Coeur du systeme : appel a Qwen3 via Ollama,
# validation stricte du JSON, gestion des erreurs.
# ─────────────────────────────────────────
import json
import logging
from datetime import datetime
from typing import Optional

import httpx
from pydantic import ValidationError

from app.schemas.ia_schemas import ReponseQwen, SCHEMA_PAR_INTENTION, IntentionType

logger = logging.getLogger("memolife.ia_service")

import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434") + "/api/generate"
MODELE = "qwen3:4b"
TIMEOUT_SECONDES = 15
NB_TENTATIVES_MAX = 2


# ─────────────────────────────────────────
# Construction du prompt systeme
# ─────────────────────────────────────────

def construire_prompt(
    message_utilisateur: str,
    profil_utilisateur: str,
    memoire_comportementale: list[dict],
    date_actuelle: Optional[datetime] = None,
) -> str:
    """
    Construit le prompt complet envoye a Qwen3.
    Qwen3 ne gere QUE l'extraction d'intention -- jamais la logique metier.
    """
    if date_actuelle is None:
        date_actuelle = datetime.now()

    memoire_texte = "Aucune habitude connue encore."
    if memoire_comportementale:
        lignes = [f"- {m['explication']}" for m in memoire_comportementale[:5]]
        memoire_texte = "\n".join(lignes)

    schema_exemple = {
        "intention": "CREER_TACHE | CREER_ROADMAP | ENREGISTRER_SUIVI | MODIFIER_TACHE | CONSULTER | AMBIGU",
        "confiance": "nombre entre 0 et 1",
        "donnees": "objet dont la forme depend de l'intention choisie",
        "reponse_naturelle": "phrase courte et naturelle a afficher a l'utilisateur",
    }

    prompt = f"""Tu es un module d'EXTRACTION D'INTENTION pour l'application MemoLife.
Tu ne geres JAMAIS la logique metier, les calculs, les rappels ou les statistiques.
Ton seul role : comprendre ce que l'utilisateur veut, et structurer cela en JSON.

Reponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou apres, sans balises markdown.

Intentions possibles et leur sens :
- CREER_TACHE : l'utilisateur veut qu'on lui rappelle quelque chose a faire.
- CREER_ROADMAP : l'utilisateur veut une feuille de route pour une formation ou un projet etale dans le temps.
- ENREGISTRER_SUIVI : l'utilisateur exprime son humeur, son etat de sante ou son ressenti du moment.
- MODIFIER_TACHE : l'utilisateur veut changer une tache existante (date, heure, titre).
- CONSULTER : l'utilisateur demande simplement de l'information (ce qu'il a a faire, sa progression...), sans rien creer ni modifier.
- AMBIGU : tu ne comprends pas suffisamment la demande pour agir avec confiance.

Contexte actuel :
- Date et heure actuelles : {date_actuelle.strftime('%Y-%m-%d %H:%M')} ({date_actuelle.strftime('%A')})
- Profil de l'utilisateur : {profil_utilisateur}
- Habitudes connues de cet utilisateur :
{memoire_texte}

Format de reponse attendu (structure generale) :
{json.dumps(schema_exemple, ensure_ascii=False, indent=2)}

Message de l'utilisateur : "{message_utilisateur}"

Reponds uniquement avec le JSON."""

    return prompt


# ─────────────────────────────────────────
# Appel reseau a Ollama
# ─────────────────────────────────────────

async def appeler_qwen(prompt: str) -> str:
    """
    Appelle Ollama en local. Retourne le texte brut produit par le modele.
    Leve une exception si Ollama est inaccessible ou trop lent.
    """
    payload = {
        "model": MODELE,
        "prompt": prompt,
        "stream": False,
        "format": "json",          # force Ollama a produire du JSON structure
        "options": {
            "temperature": 0.3,    # peu de creativite : on veut de la precision
            "num_predict": 400,    # limite la longueur, pas besoin de plus pour du JSON court
        },
        # Qwen3 a un mode "thinking" verbeux par defaut : on le desactive ici
        "think": False,
    }

    async with httpx.AsyncClient(timeout=TIMEOUT_SECONDES) as client:
        response = await client.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "")


# ─────────────────────────────────────────
# Validation stricte + retry
# ─────────────────────────────────────────

def parser_et_valider(texte_brut: str) -> Optional[ReponseQwen]:
    """
    Tente de parser le texte renvoye par Qwen3 en ReponseQwen valide.
    Retourne None si la structure generale est invalide.
    """
    try:
        donnees_json = json.loads(texte_brut)
    except json.JSONDecodeError:
        logger.warning("JSON invalide renvoye par Qwen3 : %s", texte_brut[:200])
        return None

    try:
        reponse = ReponseQwen(**donnees_json)
    except ValidationError as e:
        logger.warning("Structure ReponseQwen invalide : %s", e)
        return None

    # Validation du sous-schema specifique a l'intention
    schema_specifique = SCHEMA_PAR_INTENTION.get(reponse.intention)
    if schema_specifique is None:
        return None

    try:
        schema_specifique(**reponse.donnees)
    except ValidationError as e:
        logger.warning(
            "Donnees invalides pour l'intention %s : %s", reponse.intention, e
        )
        return None

    return reponse


def reponse_de_secours(raison: str = "Je n'ai pas bien compris votre demande.") -> ReponseQwen:
    """
    Reponse AMBIGU utilisee quand Qwen3 echoue completement (panne, JSON
    irrecuperable apres plusieurs tentatives). Garantit que l'API ne plante
    jamais cote utilisateur, meme si l'IA locale a un probleme.
    """
    return ReponseQwen(
        intention=IntentionType.AMBIGU,
        confiance=0.0,
        donnees={
            "raison": raison,
            "question_clarification": "Pouvez-vous reformuler votre demande ?",
        },
        reponse_naturelle="Desole, je n'ai pas bien saisi. Pouvez-vous reformuler ?",
    )


# ─────────────────────────────────────────
# Fonction principale exposee aux routes FastAPI
# ─────────────────────────────────────────

async def traiter_message_utilisateur(
    message_utilisateur: str,
    profil_utilisateur: str,
    memoire_comportementale: list[dict],
) -> ReponseQwen:
    """
    Point d'entree unique utilise par les routes FastAPI (ex: routes/chat.py).
    Gere le prompt, l'appel a Ollama, la validation, et le retry en cas
    d'echec -- sans jamais laisser une erreur remonter brute a l'utilisateur.
    """
    prompt = construire_prompt(
        message_utilisateur=message_utilisateur,
        profil_utilisateur=profil_utilisateur,
        memoire_comportementale=memoire_comportementale,
    )

    derniere_erreur = None

    for tentative in range(1, NB_TENTATIVES_MAX + 1):
        try:
            texte_brut = await appeler_qwen(prompt)
        except (httpx.TimeoutException, httpx.HTTPError) as e:
            derniere_erreur = e
            logger.error("Ollama inaccessible (tentative %s) : %s", tentative, e)
            continue

        reponse = parser_et_valider(texte_brut)
        if reponse is not None:
            return reponse

        logger.warning("Tentative %s/%s : JSON invalide, on reessaie.", tentative, NB_TENTATIVES_MAX)

    if derniere_erreur is not None:
        return reponse_de_secours(
            "Le service d'intelligence artificielle locale est momentanement indisponible."
        )

    return reponse_de_secours()
