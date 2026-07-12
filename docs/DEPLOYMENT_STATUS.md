# Live deployment status

Verified: 2026-07-13

## Production URLs

- Frontend: https://baiterek-flowos.vercel.app
- Backend: https://backend-production-c623.up.railway.app
- Swagger: https://backend-production-c623.up.railway.app/docs

## Infrastructure

- Next.js frontend: Vercel production deployment.
- FastAPI backend: Railway Docker deployment with health checks.
- Persistent database: Railway-managed PostgreSQL with Alembic migrations.
- Supabase compatibility: implemented through SQLAlchemy psycopg URL normalization and transaction-pooler `NullPool`; switching providers requires only `DATABASE_URL`.
- eGov/BIN, EDS, BPM, CRM and integration bus: deterministic mocks, explicitly labeled in the UI and API.

## Live evidence

- `/health`: `ok`
- `/ready`: database connected
- Swagger: HTTP 200
- Frontend: HTTP 200
- CORS: final Vercel origin allowed
- 500,000,000 KZT: feasibility study not required
- 500,000,001 KZT: feasibility study required
- Production application readiness: 100
- Submission: `BF-2026-000001`
- BPM mock: `BPM-DEMO-00000001`
- Personal account persistence: PASS

