#!/usr/bin/env bash
set -euo pipefail

cp -n .env.example .env.local || true
npm install
docker compose up -d
npm run db:generate
echo "Local PostgreSQL is running. Set DATABASE_URL in .env.local, then run npm run db:migrate and npm run db:seed."
