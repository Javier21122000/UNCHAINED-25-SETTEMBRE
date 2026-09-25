#!/usr/bin/env bash
# Scrive ADMIN_PASSWORD in .env.local senza farla passare dalla cronologia della shell.
set -euo pipefail
cd "$(dirname "$0")"

read -rsp "Password per l'admin (8-72 caratteri): " pwd1; echo
read -rsp "Ripetila: " pwd2; echo

[[ "$pwd1" == "$pwd2" ]] || { echo "Le due password non coincidono." >&2; exit 1; }
(( ${#pwd1} >= 8 )) || { echo "Servono almeno 8 caratteri." >&2; exit 1; }
(( $(printf '%s' "$pwd1" | wc -c) <= 72 )) || { echo "Massimo 72 byte: BCrypt ignora il resto." >&2; exit 1; }

tmp=$(mktemp)
grep -v '^ADMIN_PASSWORD=' .env.local > "$tmp"
printf 'ADMIN_PASSWORD=%s\n' "$pwd1" >> "$tmp"
mv "$tmp" .env.local
chmod 600 .env.local
echo "Salvata in .env.local. Ora avvia il backend con ./run-local.sh"
