# MemoLife — Backend FastAPI

Backend complet de MemoLife : authentification JWT, gestion des taches, et
integration avec l'IA locale Qwen3 via Ollama (aucune dependance a une API
payante).

## Prerequis (deja installes selon nos echanges precedents)

- Python 3.11+
- PostgreSQL 16
- Ollama avec le modele `qwen3:4b` deja telecharge (`ollama pull qwen3:4b`)

## Installation — a faire une seule fois

### 1. Ouvrir ce dossier `backend/` dans VS Code

### 2. Creer un environnement virtuel Python (recommande)

```bash
python3 -m venv venv
source venv/bin/activate
```

Sur Windows : `venv\Scripts\activate`

### 3. Installer les dependances

```bash
pip install -r requirements.txt
```

### 4. Creer la base de donnees PostgreSQL

```bash
bash creer_base_donnees.sh
```

Si le script echoue (droits sudo), cree la base manuellement :
```bash
sudo -u postgres psql
CREATE DATABASE memolife;
\q
```

### 5. Configurer le fichier .env

Copie `.env.example` vers `.env` :
```bash
cp .env.example .env
```

Ouvre `.env` et remplace `TON_MOT_DE_PASSE` par le mot de passe PostgreSQL
que tu as defini a l'installation.

### 6. Verifier qu'Ollama tourne

```bash
ollama list
```

Tu dois voir `qwen3:4b` dans la liste. Si Ollama n'est pas demarre :
```bash
ollama serve
```
(souvent demarre automatiquement comme service, dans ce cas rien a faire)

## Lancer le backend

```bash
uvicorn app.main:app --reload
```

Le serveur tourne sur **http://localhost:8000**

Documentation interactive automatique disponible sur :
**http://localhost:8000/docs**

## Tester rapidement

Dans un navigateur ou avec curl :
```bash
curl http://localhost:8000/health
```

Doit repondre : `{"statut":"ok"}`

## Structure du projet

```
backend/
├── app/
│   ├── main.py              ← point d'entree
│   ├── models/              ← tables PostgreSQL (SQLAlchemy)
│   ├── schemas/              ← contrat JSON avec Qwen3
│   ├── services/
│   │   ├── ia_service.py        ← appel a Qwen3 via Ollama
│   │   └── execution_service.py ← logique metier (sans IA)
│   ├── routes/
│   │   ├── auth.py          ← inscription / connexion JWT
│   │   └── chat.py          ← dialogue avec l'IA
│   ├── auth/                ← securite JWT
│   └── db/                  ← connexion PostgreSQL
├── requirements.txt
└── .env
```

## Tester l'API complete (ordre recommande)

1. **POST /auth/register** — creer un compte
2. **POST /auth/login** — recuperer le token JWT
3. **POST /chat/message** (avec le token) — envoyer "Rappelle-moi d'acheter du pain demain matin"
4. **POST /chat/proposition/{id}/valider** — valider la tache proposee

Tout ceci est testable directement depuis l'interface **http://localhost:8000/docs**
sans avoir besoin du frontend pour le moment.
