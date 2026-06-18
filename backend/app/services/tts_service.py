# ─────────────────────────────────────────
# FICHIER : backend/app/services/tts_service.py
# Generation de la voix qui lit les taches (rappels),
# via Piper TTS -- 100% local, gratuit, aucun appel cloud.
# ─────────────────────────────────────────
import os
import subprocess
import uuid
import logging
from pathlib import Path

logger = logging.getLogger("memolife.tts_service")

# Dossier ou sont stockes les fichiers audio generes
DOSSIER_AUDIO = Path(os.getenv("DOSSIER_AUDIO", "app/static/audio"))
DOSSIER_AUDIO.mkdir(parents=True, exist_ok=True)

# Nom du modele de voix Piper a utiliser (telecharge separement, voir README)
VOIX_FR = os.getenv("PIPER_VOIX_FR", "fr_FR-siwis-medium")
VOIX_EN = os.getenv("PIPER_VOIX_EN", "en_US-lessac-medium")


def _nom_fichier_unique() -> str:
    return f"{uuid.uuid4().hex}.wav"


def generer_audio(texte: str, langue: str = "FR") -> str | None:
    """
    Genere un fichier audio .wav a partir d'un texte, via Piper TTS.
    Retourne le chemin relatif du fichier genere, ou None en cas d'echec
    (l'appelant doit alors se contenter de l'alarme sonore + texte affiche).
    """
    if not texte or not texte.strip():
        return None

    voix = VOIX_FR if langue.upper() == "FR" else VOIX_EN
    nom_fichier = _nom_fichier_unique()
    chemin_sortie = DOSSIER_AUDIO / nom_fichier

    try:
        # Piper lit le texte depuis stdin et ecrit l'audio dans le fichier de sortie
        processus = subprocess.run(
            ["piper", "--model", voix, "--output_file", str(chemin_sortie)],
            input=texte.encode("utf-8"),
            capture_output=True,
            timeout=10,
        )
        if processus.returncode != 0:
            logger.error("Piper a echoue : %s", processus.stderr.decode(errors="ignore"))
            return None

        if not chemin_sortie.exists():
            return None

        return f"/static/audio/{nom_fichier}"

    except FileNotFoundError:
        logger.error(
            "La commande 'piper' n'est pas trouvee. "
            "Verifie que Piper TTS est installe (pip install piper-tts) "
            "et qu'il est accessible dans le PATH."
        )
        return None
    except subprocess.TimeoutExpired:
        logger.error("Piper a depasse le delai d'execution pour le texte : %s", texte[:50])
        return None
    except Exception as e:
        logger.error("Erreur inattendue lors de la generation audio : %s", e)
        return None
