#!/usr/bin/env bash
# Scrive le credenziali SMTP in .env.local senza farle passare dalla cronologia della shell.
set -euo pipefail
cd "$(dirname "$0")"

[[ -f .env.local ]] || { echo "Manca .env.local" >&2; exit 1; }

read -rp  "Indirizzo Gmail del mittente: " addr
read -rsp "Password per le app (16 caratteri, non quella dell'account): " app_pwd; echo

[[ "$addr" == *@* ]] || { echo "Non sembra un indirizzo email." >&2; exit 1; }
# Google la mostra con gli spazi, ma vanno tolti
app_pwd="${app_pwd// /}"
(( ${#app_pwd} == 16 )) || { echo "Attese 16 lettere: hai inserito ${#app_pwd} caratteri. È la password per le app, non quella dell'account." >&2; exit 1; }

tmp=$(mktemp)
grep -vE '^#?(MAIL_ENABLED|MAIL_USERNAME|MAIL_PASSWORD|MAIL_FROM)=' .env.local > "$tmp"
{
  echo "MAIL_ENABLED=true"
  printf 'MAIL_USERNAME=%s\n' "$addr"
  printf 'MAIL_PASSWORD=%s\n' "$app_pwd"
  # Gmail rifiuta un mittente diverso dall'account autenticato
  printf 'MAIL_FROM=%s\n' "$addr"
} >> "$tmp"
mv "$tmp" .env.local
chmod 600 .env.local
echo "Salvate. MAIL_ENABLED ora è true. Riavvia il backend con ./run-local.sh"
