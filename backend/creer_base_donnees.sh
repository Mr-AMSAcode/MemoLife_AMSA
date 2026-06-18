#!/bin/bash
# ─────────────────────────────────────────
# FICHIER : backend/creer_base_donnees.sh
# A executer UNE SEULE FOIS pour creer la base PostgreSQL.
# Usage : bash creer_base_donnees.sh
# ─────────────────────────────────────────

echo "Creation de la base de donnees 'memolife' dans PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE memolife;" 2>&1 || echo "(La base existe peut-etre deja, on continue)"

echo "Verification..."
sudo -u postgres psql -l | grep memolife

echo ""
echo "Termine. Tu peux maintenant lancer le backend avec :"
echo "   uvicorn app.main:app --reload"
