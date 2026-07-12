# Baiterek FlowOS

Competition-ready full-stack MVP for the unified business-support portal. Entrepreneurs discover measures, reuse a Business Passport, complete configuration-driven applications and track submission. Analysts change service rules, run a deterministic Quality Gate and publish a version without frontend changes.

## Critical demo

Both **«Приобретение вагонов в лизинг»** and **«Агробизнес: животноводство»** are strict service-definition objects interpreted by the same runtime. In the wagon service, `requested_amount > 500_000_000` dynamically requires **«Технико-экономическое обоснование»**. The rule is explicitly a demo rule, not an official approval criterion.

## Stack

- Frontend: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, responsive institutional UI.
- Backend: Python 3.12 target, FastAPI, Pydantic, SQLAlchemy, Alembic, PostgreSQL/Supabase.
- Autonomous demo: SQLite and deterministic AI/integration fallbacks.
- Deployment: Vercel-ready frontend, Railway/Render-ready backend, Docker Compose.

## Local setup

Copy `.env.example` to `.env`.

```powershell
cd backend
py -3.12 -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m alembic upgrade head
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`; Swagger is at `http://localhost:8000/docs`.

## Demo accounts

Use the three header buttons. Tokens are intentionally deterministic:

- entrepreneur: `demo-entrepreneur`;
- business analyst: `demo-analyst`;
- holding administrator: `demo-holding_admin`.

Admin UI routes use role cookies and protected API endpoints validate bearer roles. This is demo authentication; production must use an OIDC identity provider and short-lived signed tokens.

## Checks

```powershell
cd backend
python -m pytest

cd ../frontend
npm run typecheck
npm run lint
npm run build
```

## PostgreSQL / Supabase

Set `DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE` and run `alembic upgrade head`. The default SQLite URL exists only to keep the competition demo autonomous. For Supabase, add RLS policies for owner-scoped passports/applications in addition to API authorization.

## Docker

`docker compose up --build` starts PostgreSQL, backend and frontend. The backend image targets Python 3.12. Set production secrets in the hosting platform, never in source control.

## Deployment

- Vercel: root `frontend`, set `NEXT_PUBLIC_API_URL` to the public backend URL.
- Railway/Render: root `backend`, Dockerfile deployment, run migration before startup, expose `/health` and `/ready`.
- CORS: replace localhost with the production frontend origin.

### Vercel two-project deployment

Deploy the API first from `backend/` as `baiterek-flowos-api`. Set `DATABASE_URL` to PostgreSQL/Supabase for durable persistence; without it Vercel uses an explicitly temporary `/tmp` SQLite demo fallback. Set `FRONTEND_URL` after the frontend URL is known.

Deploy the portal from `frontend/` as `baiterek-flowos` with `NEXT_PUBLIC_API_URL=https://<api-project>.vercel.app`. Both directories include their own `vercel.json`. Vercel preview domains are accepted by the backend CORS policy.

## Mocks and limitations

eGov/BIN, digital signature, BPM, CRM and integration bus are clearly labeled deterministic mocks. AI Compiler and Policy Diff use a deterministic fallback without keys; external providers may be wired later. Uploaded files are validated as metadata in the MVP and should use object storage plus malware scanning in production. Seeded projects and analytics are labeled demo data.

See [architecture](docs/ARCHITECTURE.md), [demo script](docs/DEMO_SCRIPT.md), and [final QA](FINAL_QA_REPORT.md).

Production Supabase/Railway/Vercel wiring is documented in [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md).
