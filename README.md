# Forms App (Next.js + NestJS)

A mini full-stack forms app for internal tooling. It supports:

- Questionnaire CRUD from question objects
- Publish/share link flow with `access_token`
- Public response submission
- Results view with basic analytics
- JSON import/export for questionnaires and responses

This project uses:

- Frontend: Next.js + TypeScript
- Backend: NestJS + TypeScript
- Storage: In-memory object store (no database)
- Workspace: pnpm + Turbo monorepo

## Project Structure

```text
forms/
  apps/
    api/   # NestJS API
    web/   # Next.js frontend
  samples/ # Importable questionnaire/response JSON examples
```

## Requirements

- Node.js 20+
- pnpm 10+

## Install

```bash
pnpm install --no-frozen-lockfile
```

## Run in Development

```bash
pnpm dev
```

Default ports:

- Web: `http://localhost:5173`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/doc`

If needed, set frontend API base URL:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Then edit:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Build

```bash
pnpm exec turbo build
```

## Core Flows

1. Create questionnaire (UI builder or JSON import)
2. Publish questionnaire to issue one-time pad style `access_token`
3. Share link in this format:
   - `http://localhost:5173/forms/:formId?access_token=ONE_TIME_PAD`
4. Submit public responses
5. Review submissions and analytics in Results

## API Overview

### Admin questionnaire routes

- `GET /questionnaires`
- `POST /questionnaires`
- `GET /questionnaires/:id`
- `PATCH /questionnaires/:id`
- `DELETE /questionnaires/:id`
- `POST /questionnaires/:id/publish`
- `POST /questionnaires/:id/unpublish`

### Public routes

- `GET /public/questionnaires/:id?access_token=...`
- `POST /public/questionnaires/:id/responses`

### Import/export and reporting

- `POST /questionnaires/import`
- `GET /questionnaires/:id/export`
- `POST /questionnaires/:id/responses/import`
- `GET /questionnaires/:id/responses/export`
- `GET /questionnaires/:id/responses`
- `GET /questionnaires/:id/analytics`

## Sample JSON Files

The `samples/` folder includes ready-to-import examples:

- Incident intake
- Onboarding checklist
- Access request
- Post-incident review

Each form has:

- `*.questionnaire.sample.json`
- `*.responses.sample.json`

Use questionnaire import in the "New questionnaire" page, and response import in each questionnaire's "Results" page.

## Notes

- Authentication/authorization is intentionally out of scope.
- Data is kept in memory, so restarting the API resets questionnaires and responses.
