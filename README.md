# Lattice Portfolio

A personal portfolio and writing site — minimal, readable, and calm. Built for writing, systems work, photography, and a private day tracker.

**Live sections:** Index · Writing · Systems · Experience · Photography · Projects · Admin

## Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** FastAPI + SQLite
- **Hosting:** Google Cloud Run (free tier eligible)

## Quick start (local)

```bash
./dev.sh
```

Open [http://localhost:8080](http://localhost:8080). Admin: [http://localhost:8080/admin](http://localhost:8080/admin) (default password `admin123` until you change `.env`).

Or run frontend + backend separately — see `.env.example`.

## Admin panel

Go to `/admin` to sign in and:

- **Write articles** in Markdown (with screenshot / Excalidraw attachments)
- **Add Instagram photo links**
- **Day tracker** at `/private/days` — weekly summary after 7 days logged
- **Who I am** at `/private/identity`

Articles and uploads are stored under `data/` (SQLite at `data/site.db`, files in `data/uploads/`).

## Deploy to GitHub Pages (sistusrikanth.github.io)

The **frontend** is hosted free on GitHub Pages. The **API** (articles, admin, uploads, day tracker) stays on Cloud Run.

### One-time setup

1. **Rename the GitHub repo** to `sistusrikanth.github.io` (Settings → General → Repository name).  
   That gives you `https://sistusrikanth.github.io` instead of `…/personal-site`.

2. **Enable GitHub Pages** in repo Settings → Pages → Source: **GitHub Actions**.

3. Push to `main` — `.github/workflows/pages.yml` builds and deploys automatically.

### How it works

| Part | Host |
|------|------|
| React site | `https://sistusrikanth.github.io` |
| API + database + uploads | `https://srikanthsistu-website-….run.app` |

Admin: `https://sistusrikanth.github.io/admin` (calls Cloud Run API in the background).

### Local Pages build (optional)

```bash
cd frontend
VITE_API_URL=https://srikanthsistu-website-zxwzvy3hpq-uc.a.run.app npm run build:pages
```

## Deploy to GCP Cloud Run (free tier)

Cloud Run's always-free tier includes **2 million requests/month** — enough for a personal site.

**Requirements:** [Google Cloud SDK](https://cloud.google.com/sdk/docs/install), a GCP project with billing enabled (you won't be charged within free-tier limits for normal personal traffic), and:

```bash
gcloud auth login
gcloud auth application-default login
```

### One-command deploy

```bash
export GCP_PROJECT_ID=your-gcp-project-id
export ADMIN_PASSWORD='your-secure-admin-password'
./scripts/deploy-gcp.sh
```

The script will:

1. Enable Cloud Run, Cloud Build, Artifact Registry, and Storage APIs
2. Create a GCS bucket for persistent SQLite + uploads
3. Deploy the container with `/data` mounted to that bucket

Your site will be at `https://srikanthsistu-website-XXXXX-uc.a.run.app`

### Manual deploy

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com storage.googleapis.com

gcloud run deploy srikanthsistu-website \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars "DATA_DIR=/data,SITE_NAME=srikanthsistu website,ADMIN_PASSWORD=...,ADMIN_SECRET_KEY=..."
```

For production, always mount a GCS volume at `/data` so articles survive container restarts — the deploy script does this automatically.

### CI/CD with GitHub Actions

After the first manual deploy, set up [Workload Identity Federation](https://cloud.google.com/blog/products/identity-security/enabling-keyless-authentication-from-github-actions) and add GitHub secrets:

| Secret | Value |
|--------|-------|
| `GCP_PROJECT_ID` | Your GCP project ID |
| `GCP_DATA_BUCKET` | `{PROJECT_ID}-personal-site-data` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | From WIF setup |
| `GCP_SERVICE_ACCOUNT` | Deploy service account email |
| `ADMIN_PASSWORD` | Admin panel password |
| `ADMIN_SECRET_KEY` | Random 32-char string |

Push to `main` to deploy via `.github/workflows/deploy.yml`.

## Customize

Set environment variables (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `SITE_NAME` | Your name in the header |
| `SITE_TAGLINE` | Footer tagline |
| `SITE_LOCATION` | City shown on index page |
| `SITE_GITHUB` | GitHub profile URL |
| `SITE_EMAIL` | Contact email |
| `ADMIN_PASSWORD` | Admin panel password |
| `ADMIN_SECRET_KEY` | JWT signing key (random string) |
| `DATA_DIR` | Database path (`/data` in production) |

## Project structure

```
personal-site/
├── frontend/          # React SPA
├── backend/           # FastAPI API + static file serving
├── data/              # SQLite + uploads (gitignored, local only)
├── scripts/           # deploy-gcp.sh
├── Dockerfile
└── .github/workflows/
```
