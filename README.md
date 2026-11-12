# Mongo-ExForge

Export data from any MongoDB into CSV, JSON or XLSX files, as background jobs, through a REST API. Built with NestJS, BullMQ and S3-compatible object storage.

## How it works

1. A user signs up and receives a bearer token.
2. The user creates an export job: one or more MongoDB sources (URI + collection + filters), the fields to keep, a sort order and a format.
3. The job is queued in Redis (only the job id travels through Redis). A worker streams the documents from the source with a cursor, formats them on the fly and uploads the result to object storage with a multipart upload. Memory stays flat, even for a million rows.
4. The user polls the job (status, progress, error) and downloads the file. The API checks ownership and answers with a 302 to a presigned URL that lives for 5 minutes. The bucket is never public.
5. An hourly sweep deletes the objects of old exports and marks the jobs as `expired`.

Job states: `pending`, `in_progress`, `completed`, `failed`, `expired`. A failed attempt is retried (`EXPORT_ATTEMPTS`) with backoff; a rejected request (bad collection, row cap, no permission) fails at once without retries.

## Quick start with Docker

```bash
docker compose up --build
```

This starts MongoDB, Redis, MinIO (S3-compatible, port 9000) and the API on http://localhost:3000. Create `application/.env` first (see below) so the API gets `JWT_SECRET` and `ENCRYPTION_SECRET`.

Swagger: http://localhost:3000/docs

## Local development

Requirements: Node.js 20+, MongoDB, Redis and an S3-compatible store (MinIO works).

```bash
cd application
npm install
cp .env.example .env
npm run start:dev
```

Generate the secrets:

```bash
openssl rand -hex 32   # ENCRYPTION_SECRET (64 hex characters)
openssl rand -base64 48   # JWT_SECRET (at least 32 characters)
```

### Environment

See `application/.env.example`. The required keys are `MONGODB_URI`, `JWT_SECRET` and `ENCRYPTION_SECRET`, plus `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` while `STORAGE_DRIVER=s3` (the default). The app refuses to start when one is missing or weak.

### Storage drivers

- `s3` (default): any S3-compatible store (MinIO locally, Cloudflare R2 when deployed). Downloads are presigned URLs.
- `local`: files are written under `LOCAL_STORAGE_DIR` (default: the system temp directory) and served by the API at `/files/<token>`. The token is an HMAC-signed, short-lived link bound to one file. Use it for demos and hosts without persistent disk, since files vanish when the instance restarts.

### Web app

`web/` is a small React app (English and Portuguese) with login, exports, new export, saved connections and account pages. In development run `npm run dev` inside `web/` (it proxies to the API on port 3000). To let the API serve the build, run `npm run build` inside `web/` and set `WEB_DIST_DIR` to the absolute path of `web/dist`; the app then opens at `/`.

## Authentication (breaking change)

Every route requires `Authorization: Bearer <token>`, except `POST /user` (sign up), `POST /user/login`, `GET /health` and `GET /files/:token` (signed link).

- Missing or invalid token: `401`.
- There is no user listing. Users only see and change their own account through `GET|PUT|DELETE /user/me`.
- Login answers the same `401 Invalid credentials` for an unknown email and for a wrong password.
- A token stops working as soon as the account is deleted.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/user` | Sign up, returns `{ token }` |
| POST | `/user/login` | Log in, returns `{ token }` |
| GET, PUT, DELETE | `/user/me` | Your account |
| GET | `/job/:id/download-url` | Same as `/job/:id/download`, but returns `{ url }` as JSON |
| GET | `/files/:token` | Public signed download used by `STORAGE_DRIVER=local` |
| POST | `/mongo/inspect` | List collections and sampled fields of up to 5 sources |
| POST | `/job` | Create an export job |
| GET | `/job` | List your jobs (`page`, `limit`) |
| GET | `/job/:id` | Status, progress, error |
| GET | `/job/:id/download` | 302 to a 5-minute presigned URL |
| GET | `/health` | MongoDB, Redis and storage probes |

Create a job:

```bash
curl -X POST http://localhost:3000/job \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "name": "Adults",
    "export_format": "csv",
    "query": [{ "uri": "mongodb://host:27017/app", "collection": "people", "field": "age", "operator": "gte", "value": 30 }],
    "fields": ["name", "age", "address.city"],
    "sort": { "age": "asc" }
  }'
```

Operators: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`. Filters on the same source and collection are combined with AND; different sources are concatenated. Download the finished file with `curl -L -H "Authorization: Bearer $TOKEN" http://localhost:3000/job/<id>/download -o export.csv` (the presigned URL carries its own signature, so `-L` is enough).

## Security notes

- Filters are structured (`field`, `operator`, `value`). Values must be scalars or arrays of scalars, so `$where`, `$expr` and operator objects cannot be injected. Field and collection names are validated; `system.*` collections are refused.
- Source URIs are stored encrypted (AES-256-GCM with a version prefix) and are never returned by the API.
- Source URIs must be `mongodb://` or `mongodb+srv://`. Hosts that resolve to loopback, private, link-local or metadata addresses are refused, resolved through DNS (SRV targets included) and checked again at connect time. For local development set `EXFORGE_ALLOW_PRIVATE_URIS=true`; it is ignored when `NODE_ENV=production`.
- CSV cells that start with `=`, `+`, `-`, `@`, tab or carriage return are prefixed with a quote to block formula injection.
- Downloads check ownership, then redirect to a presigned URL valid for 5 minutes.
- helmet, a CORS allow-list and a strict `ValidationPipe` (whitelist, forbid unknown properties, size caps) are enabled. Bull Board (`/bull-board`) stays off unless basic-auth credentials are set.

## Free deploy (Cloudflare R2)

The storage adapter speaks the S3 API, so Cloudflare R2 (free tier) works without code changes:

```
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=<bucket>
S3_ACCESS_KEY_ID=<r2 access key>
S3_SECRET_ACCESS_KEY=<r2 secret key>
S3_FORCE_PATH_STYLE=true
S3_AUTO_CREATE_BUCKET=false
```

Create the bucket and an API token with object read and write permission in the Cloudflare dashboard. Keep the bucket private. As a safety net, add a bucket lifecycle rule that deletes objects under `exports/` after a few days; the hourly sweep already removes them after `EXPORT_TTL_HOURS`.

## Tests

```bash
cd application
npm test            # unit tests
npm run test:e2e    # needs MongoDB, Redis and MinIO

cd ../web
npm test            # web unit tests and the i18n parity suite
```

The e2e suites read the same variables as the app (`MONGODB_URI`, `REDIS_HOST`, `REDIS_PORT`, `S3_*`) and default to the standard local ports. They create their own users and a throwaway source database, and use `EXFORGE_ALLOW_PRIVATE_URIS=true` so the test MongoDB on localhost is reachable; a separate suite proves the same URIs are refused when it is off.

## Project structure

```
web/                 React app (Vite), translations in src/i18n
application/src
├── domain/          entities, ports, repositories, types, constants, enums
├── application/     use cases, services, errors
├── infrastructure/  mongo, queue, storage, auth, scheduler, http security, health
├── presentation/    controllers, presenters, mappers
├── shared/          DTOs, validators, responses
└── common/          env config and helpers
```

## CI/CD

Pull requests to `main` run `ci.yml`: `api` (unit tests, build), `web` (tests, build) and `e2e` (the API end-to-end suite against MongoDB, Redis and MinIO containers). The `ci` job is the required status check of `main`: a pull request cannot be merged until it passes.

Every push to `main` that touches `application/**` or `web/**` runs `sync-demo-host.yml`: it applies that exact commit's change to the vendored copy in the private `PedroProni/orbit-demo-host` repository (`exforge/application` and `exforge/web`) and opens a `sync/mongo-exforge-<sha>` pull request there. The demo host runs its own tests and image build, merges the pull request by itself when they pass, waits for the Render deploy of the commit and then runs a smoke test against production. If the change cannot be applied (for example it conflicts with a demo-only patch) the job opens an issue in this repository. Needs the repository secret `DEMO_HOST_TOKEN` (fine-grained token limited to `orbit-demo-host`).
