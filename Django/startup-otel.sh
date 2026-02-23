#!/usr/bin/env bash
# django/startup-otel.sh
# Minimal OpenTelemetry wrapper for Django apps.
# 
# Developers: 
#   1. Copy this file to your project (e.g. /app/startup-otel.sh)
#   2. Make it executable: chmod +x startup-otel.sh
#   3. In docker-compose.yml, change your command to:
#      command: bash /app/startup-otel.sh
#   4. Inside the script, replace the example line with YOUR original command,
#      but PREFIX it with "opentelemetry-instrument"
#
# Example (if you use gunicorn):
#   exec opentelemetry-instrument gunicorn myproject.wsgi:application --bind 0.0.0.0:8000 --workers 4
#
# Example (if you use uvicorn):
#   exec opentelemetry-instrument uvicorn myproject.asgi:application --host 0.0.0.0 --port 8000
#
# Why this script?
# - Keeps env vars in docker-compose.yml (single source of truth)
# - Lets you keep all your custom flags (workers, reload, log-level, etc.)
# - Optional: add DB wait, migrations, or debug prints later

set -e  # Exit immediately if any command fails

# Optional: Wait for database (uncomment if your app needs it)
# echo "Waiting for database..."
# while ! nc -z db 5432; do
#   sleep 1
# done
# echo "Database ready!"

# Optional: Run migrations automatically on startup
# python manage.py migrate --noinput

# ────────────────────────────────────────────────
# IMPORTANT: Replace the line below with YOUR actual command,
# but add "opentelemetry-instrument" at the beginning.
#
# Do NOT remove "exec" — it replaces the shell process with your app (best practice in Docker)

exec opentelemetry-instrument \
  gunicorn myproject.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --log-level info