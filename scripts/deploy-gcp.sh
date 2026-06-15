#!/usr/bin/env bash
# One-time setup + deploy personal-site to GCP Cloud Run (free tier eligible).
# Usage: ./scripts/deploy-gcp.sh [PROJECT_ID]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-srikanthsistu-website}"
PROJECT_ID="${1:-${GCP_PROJECT_ID:-}}"

if [[ -z "$PROJECT_ID" ]]; then
  echo "Usage: GCP_PROJECT_ID=your-project ./scripts/deploy-gcp.sh"
  echo "   or: ./scripts/deploy-gcp.sh your-project-id"
  exit 1
fi

if ! command -v gcloud >/dev/null; then
  echo "Install Google Cloud SDK first: brew install --cask google-cloud-sdk"
  exit 1
fi

BUCKET="${PROJECT_ID}-personal-site-data"
ADMIN_SECRET_KEY="${ADMIN_SECRET_KEY:-$(openssl rand -hex 16)}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

if [[ -z "$ADMIN_PASSWORD" ]]; then
  read -rsp "Admin password for /admin: " ADMIN_PASSWORD
  echo
fi

echo "→ Project: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

echo "→ Enabling APIs..."
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  cloudbuild.googleapis.com storage.googleapis.com --quiet

if ! gcloud artifacts repositories describe cloud-run-source-deploy \
  --location="$REGION" >/dev/null 2>&1; then
  echo "→ Creating Artifact Registry repo..."
  gcloud artifacts repositories create cloud-run-source-deploy \
    --repository-format=docker --location="$REGION" --quiet
fi

if ! gcloud storage buckets describe "gs://${BUCKET}" >/dev/null 2>&1; then
  echo "→ Creating GCS bucket for SQLite + uploads..."
  gcloud storage buckets create "gs://${BUCKET}" --location="$REGION" --uniform-bucket-level-access
fi

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
RUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "→ Granting Cloud Run access to data bucket..."
gcloud storage buckets add-iam-policy-binding "gs://${BUCKET}" \
  --member="serviceAccount:${RUN_SA}" \
  --role="roles/storage.objectAdmin" --quiet >/dev/null

echo "→ Deploying to Cloud Run..."
cd "$ROOT"

ENV_FILE="$(mktemp)"
trap 'rm -f "$ENV_FILE"' EXIT
cat > "$ENV_FILE" <<EOF
DATA_DIR: /data
SITE_NAME: "srikanthsistu website"
SITE_TAGLINE: "writing, systems & photography"
SITE_LOCATION: Lisbon
SITE_GITHUB: https://github.com/sistusrikanth
ADMIN_PASSWORD: "${ADMIN_PASSWORD}"
ADMIN_SECRET_KEY: "${ADMIN_SECRET_KEY}"
EOF

gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2 \
  --add-volume "name=data,type=cloud-storage,bucket=${BUCKET}" \
  --add-volume-mount "volume=data,mount-path=/data" \
  --env-vars-file "$ENV_FILE"

URL="$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')"
echo ""
echo "Deployed: $URL"
echo "Admin:    $URL/admin"
echo ""
echo "Save these locally (not committed to git):"
echo "  ADMIN_PASSWORD=$ADMIN_PASSWORD"
echo "  ADMIN_SECRET_KEY=$ADMIN_SECRET_KEY"
echo "  GCP_PROJECT_ID=$PROJECT_ID"
