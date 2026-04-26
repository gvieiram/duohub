#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# Vercel build script — chamado automaticamente pela Vercel via package.json#vercel-build.
#
# Fluxo:
#   1. Gera o Prisma Client (sempre)
#   2. Aplica migrations APENAS em produção (não em previews)
#   3. Builda o Next.js
#
# Por que migrations só em prod:
#   - Previews compartilham o banco de produção (DATABASE_URL é o mesmo)
#   - Se rodassem migrations em todo PR, qualquer migration ainda não aprovada
#     bagunçaria o schema de prod e criaria race conditions entre PRs concorrentes
#   - Migrations só vão pra prod quando o PR é mergeado em main
#
# Para simular localmente:
#   VERCEL_ENV=preview    bash scripts/vercel-build.sh   # pula migrations
#   VERCEL_ENV=production bash scripts/vercel-build.sh   # roda migrations
# ----------------------------------------------------------------------------

set -euo pipefail

echo "▲ Vercel build — env: ${VERCEL_ENV:-unknown}"

echo "→ Generating Prisma Client"
pnpm prisma generate

if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "→ Applying database migrations (production)"
  pnpm prisma migrate deploy
else
  echo "→ Skipping migrations (env=${VERCEL_ENV:-unset})"
fi

echo "→ Building Next.js"
pnpm next build
