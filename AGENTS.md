# Base44 Dev Environment

## Project
PrépaBAC Mauritanie — Next.js 16 app (React 19, pnpm) for BAC exam prep. Works offline via localStorage; PostgreSQL is used only for optional cross-device progress sync (`/api/progress`).

## Stack
- **Runtime**: Node 22 (via `node:22-alpine`)
- **Package manager**: pnpm (lockfile: `pnpm-lock.yaml`)
- **Framework**: Next.js 16 dev server (`next dev -H 0.0.0.0 -p 3000`)
- **Database**: PostgreSQL 16 (`postgres:16-alpine`), local only — no external credentials needed

## Running
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
- Web service installs deps with `pnpm install --frozen-lockfile` then starts `next dev`.
- The `migrate` one-shot service applies `schema.sql` (creates the `progress` table) before the web service starts.
- `DATABASE_URL` is set in `.env.base44-defaults` (overridden by `/run/base44/app.env` if present).

## Notes
- The API route (`app/api/progress/route.ts`) connects with `ssl: { rejectUnauthorized: false }`. Local postgres does not enable SSL, so progress sync returns 500 silently — the app still works fully offline. This is expected.
- `next.config.mjs` sets `allowedDevOrigins` from `BASE44_PUBLIC_HOST_SUFFIX` so the preview origin can access dev assets/HMR.
- Source is bind-mounted at `/app`; edits hot-reload via Next.js HMR.
