# Final QA report

Date: 2026-07-12

| Requirement | Result | Evidence |
|---|---|---|
| Monorepo and required stack | PASS | `frontend`, `backend`, `supabase`, Docker; Next/TS/Tailwind and FastAPI/Pydantic/SQLAlchemy/Alembic |
| Backend startup | PASS | Live `/health` = `ok`; `/ready` = `true` |
| Frontend production build | PASS | Next 15 optimized build compiled; route and middleware generated; HTTP 200 startup smoke |
| Frontend typecheck | PASS | `tsc --noEmit` exit 0 |
| Frontend lint | PASS | Vercel production build ran Next.js ESLint and type validation successfully |
| Demo login / role protection | PASS | Three role routes set demo role; middleware and API dependencies protect Studio/admin |
| Shared runtime for both services | PASS | Both definitions in `data.py`; automated `test_both_services_share_runtime_and_quality_passes` |
| Conditional documents | PASS | Automated boundary test and live smoke: 500M false, 500M+1 true |
| Calculations | PASS | Deterministic expected-value unit test |
| Business Passport prefill | PASS | `/api/passport`; renderer maps `prefill` fields and displays counters |
| Personalized support route | PASS | Deterministic `/api/support-route` with explanations, blockers, actions and organization |
| Readiness check | PASS | Tests prove missing conditional document blocks; UI shows score and direct targets |
| Persistence and account | PASS | SQLite/Postgres SQLAlchemy; submission test confirms account retrieval |
| Duplicate submission protection | PASS | Test confirms second submission returns same result with `duplicate=true` |
| EDS / BPM / eGov mocks | PASS | Clearly labeled success payloads, external ID, timeline and sanitized logs |
| Service Studio publication | PASS | Quality-gated version endpoint archives old version; runtime resolves latest published definition |
| Quality Gate | PASS | Broken reference automated test blocks publication; scenarios/readiness displayed |
| AI fallback | PASS | Compiler and diff return deterministic, review-required outputs without keys |
| Map | PASS | 25 seeded projects, filters, totals, markers/cards |
| Reports | PASS | 8 seeded items and working preview container |
| Business tools | PASS | Calculator, diagnostic, business-plan/financial-model/application/document templates |
| Admin analytics | PASS | Application metrics, regions, validation/docs and User Friction panel; demo labeled |
| Mobile/accessibility/error states | PASS | Responsive breakpoints, semantic controls, contrast, loading/error/empty states |
| Documentation/deployment | PASS | README, architecture, demo, checklist, pitch, env, Docker Compose and Dockerfiles |
| Automated browser click-through | PARTIAL | Browser-control runtime reported no available browser; live HTTP and API end-to-end smoke used instead |

## Executed evidence

```text
backend pytest: 7 passed
frontend typecheck: exit 0
frontend production build: compiled successfully
backend live: health=ok, ready=true
frontend live: HTTP 200, title contains Baiterek FlowOS
threshold: 500000000 => no feasibility_study
threshold: 500000001 => feasibility_study required
```

## Verdict

**PASS for the deployed competition MVP critical flow.** Browser automation was unavailable in the Codex surface, so production HTTP, CORS, rule-boundary and API write-flow tests were used instead. Before a real regulated launch, replace demo authentication/mocks and add object-storage security controls described in README.
