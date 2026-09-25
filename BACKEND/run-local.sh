#!/usr/bin/env bash
# Avvia il backend leggendo i segreti da .env.local, che resta fuori dal repository.
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f .env.local ]]; then
  echo "Manca .env.local: copia .env.local.example e compilalo." >&2
  exit 1
fi

set -a
source .env.local
set +a

if [[ -z "${ADMIN_PASSWORD:-}" ]]; then
  echo "ADMIN_PASSWORD è vuota in .env.local: nessun amministratore verrà creato." >&2
  echo "Impostala con:  ./set-admin-password.sh" >&2
fi

exec ./mvnw spring-boot:run
