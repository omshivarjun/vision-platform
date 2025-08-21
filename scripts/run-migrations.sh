#!/usr/bin/env bash
set -euo pipefail

echo "Running SQL migrations for services/api..."
if [ -z "${DATABASE_URL:-}" ]; then
  echo "Please set DATABASE_URL environment variable or update .env"; exit 1
fi

psql "$DATABASE_URL" -f ./services/api/migrations/20250821_create_core_tables.sql

echo "Migrations applied."
