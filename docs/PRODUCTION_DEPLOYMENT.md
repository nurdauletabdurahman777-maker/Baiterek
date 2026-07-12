# Production deployment: Supabase + Railway + Vercel

## Target topology

```text
Vercel / Next.js frontend
        |
        | NEXT_PUBLIC_API_URL
        v
Railway / FastAPI backend
        |
        | DATABASE_URL (TLS)
        v
Supabase / PostgreSQL
```

The eGov/BIN, EDS, BPM, CRM and integration-bus connectors remain explicitly labeled mocks until official endpoint credentials and agreements are supplied.

## 1. Supabase

Create a project named `baiterek-flowos` in the closest suitable region. Use the transaction pooler connection string for Railway and convert its scheme to SQLAlchemy psycopg form:

```text
postgresql+psycopg://USER:PASSWORD@HOST:6543/postgres?sslmode=require
```

Do not commit this value. Store it only as Railway variable `DATABASE_URL`. Alembic runs automatically before Railway starts the API.

## 2. Railway backend

Create a service from `nurdauletabdurahman777-maker/Baiterek` with root directory `backend`.

Set:

```text
DATABASE_URL=<Supabase pooler URL>
FRONTEND_URL=https://<frontend-project>.vercel.app
DEMO_MODE=true
APP_ENV=production
```

Railway reads `backend/railway.toml`, builds the Python 3.12 Dockerfile, runs migrations, starts Uvicorn on `$PORT`, and checks `/health`. Generate a public domain and verify `/health`, `/ready`, `/version`, and `/docs`.

## 3. Vercel frontend

Import the same repository as a second project with root directory `frontend`.

Set in Production and Preview:

```text
NEXT_PUBLIC_API_URL=https://<railway-backend-domain>
```

Deploy and then update Railway `FRONTEND_URL` to the final Vercel production domain. Backend CORS additionally accepts Vercel preview domains.

## 4. Production smoke test

1. Open the Vercel URL and load the service catalog.
2. Log in as analyst and publish the wagon rule.
3. Enter `500000000` — feasibility study must not appear.
4. Enter `500000001` — feasibility study must appear.
5. Submit a complete application and confirm it in the personal account.
6. Restart the Railway service and confirm the application still exists in Supabase.
7. Check Railway logs and the FlowOS integration log for sanitized payloads only.

## GitHub Actions automation

`FlowOS CI` validates every push and pull request. After the Supabase, Railway and Vercel projects are created, add these GitHub environment secrets under `production`:

```text
RAILWAY_TOKEN
RAILWAY_SERVICE_ID
RAILWAY_PUBLIC_URL
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

Store `DATABASE_URL`, `FRONTEND_URL`, `DEMO_MODE` and `APP_ENV` in Railway itself. Store `NEXT_PUBLIC_API_URL` in Vercel itself as well as `RAILWAY_PUBLIC_URL` in GitHub. Run the **Deploy production** workflow manually; it deploys Railway first, then builds and deploys the frontend against the live backend.
