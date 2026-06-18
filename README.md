# MemoLife — Projet complet

Assistant personnel intelligent fonctionnant **100% en local** (Ollama + Qwen3
+ Piper TTS), sans aucune dependance a une API cloud payante.

## Architecture

```
memolife/
├── backend/    ← FastAPI + PostgreSQL + Qwen3 (Ollama) + Piper TTS
└── frontend/   ← React Native (Expo) + TypeScript
```

## Prerequis (deja installes selon nos echanges precedents)

- Python 3.11+, PostgreSQL 16, Node.js 18+, Git
- Ollama avec `qwen3:4b` (`ollama pull qwen3:4b`)
- Piper TTS (installe via `pip install piper-tts`, inclus dans requirements.txt)

---

## 1. Installer et lancer le BACKEND

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Telecharger une voix Piper en francais

```bash
mkdir -p ~/.local/share/piper-voices
cd ~/.local/share/piper-voices
# Telecharge le modele de voix francaise (environ 60 Mo)
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx.json
cd -
```

### Creer la base de donnees

```bash
bash creer_base_donnees.sh
```

### Configurer l'environnement

```bash
cp .env.example .env
# Ouvrir .env et renseigner le mot de passe PostgreSQL choisi a l'installation
```

### Lancer le serveur

```bash
uvicorn app.main:app --reload
```

Backend disponible sur **http://localhost:8000**
Documentation interactive : **http://localhost:8000/docs**

---

## 2. Installer et lancer le FRONTEND

```bash
cd frontend
npm install --legacy-peer-deps
```

### Configurer l'URL du backend

Ouvre `app/services/api.ts` et remplace `BASE_URL` par l'adresse IP locale
de ta machine (visible avec `ip addr` ou `ifconfig`), par exemple :

```ts
const BASE_URL = 'http://192.168.1.42:8000';
```

⚠️ Ton telephone et ton ordinateur doivent etre connectes au **meme reseau Wi-Fi**.

### Lancer l'application

```bash
npx expo start
```

Scanne le QR code avec l'application **Expo Go** sur ton telephone.

---

## Fonctionnalites couvertes

| Module | Statut |
|---|---|
| Authentification (inscription/connexion JWT) | ✅ |
| Onboarding personnalise (5 etapes) | ✅ |
| Chat avec IA locale (Qwen3 via Ollama) | ✅ |
| Validation/refus des propositions IA | ✅ |
| Gestion des taches (CRUD complet) | ✅ |
| Roadmap (formation/projet) avec etapes auto-generees | ✅ |
| Suivi medicaments + rappels de prise | ✅ |
| Budget mensuel en FCFA + depenses par categorie | ✅ |
| Suivi personne (sante, humeur, presence) | ✅ |
| Rappels avec alarme sonore + lecture vocale Piper | ✅ |
| Memoire comportementale explicable (PostgreSQL) | ✅ |

## Philosophie respectee

- **L'IA (Qwen3) ne fait QUE comprendre et structurer** — jamais de calcul, jamais de logique metier.
- **Toute la logique reelle est en Python/FastAPI** (`execution_service.py`).
- **Rien ne s'execute sans validation explicite de l'utilisateur** (`PropositionIA`).
- **Zero dependance a une API payante** — Qwen3 et Piper tournent tous les deux en local.
