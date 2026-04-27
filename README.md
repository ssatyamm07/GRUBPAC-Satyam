# Content Broadcasting Backend

Backend-only service for subject-based educational content: teachers upload material, principals approve or reject it, and students consume **approved, scheduled** content via a **public** live API with time windows and per-subject rotation.

## Tech Stack

- Node.js (ES modules) + Express 5
- PostgreSQL + Sequelize ORM
- JWT (`jsonwebtoken`) + `bcrypt`
- `multer` for uploads — **local** `uploads/` by default, or **Amazon S3** when `S3_*` / `AWS_*` env vars are set

## Features Implemented

| Area | Details |
|------|---------|
| **Auth** | Register / login; JWT; passwords hashed with bcrypt |
| **RBAC** | `authenticate` + `authorize`; teacher vs principal routes separated |
| **Upload** | Teacher-only; JPG / PNG / GIF; max **10 MB**; optional `description`, `start_time` + `end_time` (both required together if used). **S3:** set AWS credentials + bucket → files go to S3 and `file_path` stores the public URL |
| **Content window** | `PATCH /api/content/:id/window` — teacher sets/clears ISO `start_time` / `end_time` without re-uploading |
| **Approval** | Principal: list all / pending, approve, reject (**JSON body must include `"reason"`** for reject) |
| **Schedule** | Principal: `POST` / `GET` / `DELETE` schedule rows (`rotation_order`, `duration` minutes); links content to subject slots |
| **Public live** | `GET /api/public/live/:teacherId` optional `?subject=`; approved + scheduled + inside window only; rotation by duration; empty → `{ "message": "No content available" }` |
| **Security** | `User` model default scope excludes `password_hash`; login uses `User.unscoped()` for credential check |
| **Docs** | `architecture-notes.txt` (assignment requirement) |

## Project Structure

```
src/
  controllers/   # HTTP handlers
  routes/          # Route definitions + middleware chains
  services/        # Business logic
  middlewares/     # auth, role, upload
  models/          # Sequelize models + associations
  config/          # DB connection
  utils/           # JWT helpers, optional S3 upload
db/
  schema.sql       # PostgreSQL DDL
  seed.sql         # Optional seed data
scripts/           # db:reset, db:seed
```

## Environment Variables

Create `.env` in the project root:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grubpac
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret
```

### Optional: Amazon S3 uploads

If **all** of the following are set, uploads use **in-memory** multer and `PutObject` to S3; `file_path` on `content` is the object URL. If any are missing, the app keeps **local disk** storage under `uploads/`.

```
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=your-bucket-name
```

Optional — public URL base if you use **CloudFront** or a custom domain (otherwise the default virtual-hosted URL is built from bucket + region):

```
S3_PUBLIC_BASE_URL=https://d1234567890.cloudfront.net
```

**Bucket policy:** objects must be readable by clients that open `file_path` in a browser (e.g. `s3:GetObject` for `public`, or restrict to CloudFront OAC). This repo does not set object ACLs; configure access in AWS.

Use the **same** `PORT` for every Postman request (avoid mixing `5000` and `5006` unless both are intentional).

## Setup

```bash
npm install
npm run db:reset
npm run db:seed    # optional; requires Docker Postgres if using default script
npm run dev
```

### Docker (Postgres)

```bash
docker compose up -d
npm run db:reset
npm run db:seed
```

## End-to-End Flow (Getting Live Content)

1. **Register** principal and teacher → **login** each → save **full** JWT (`eyJ...` three segments).
2. **Teacher** `POST /api/content/upload` (multipart: `title`, `subject`, `file`; optional `start_time`, `end_time`).
3. **Principal** `PATCH /api/approval/approve/:id`.
4. If times are missing: **Teacher** `PATCH /api/content/:id/window` with ISO `start_time` / `end_time` bracketing **now** (UTC).
5. **Principal** `POST /api/schedule` with `content_id`, `subject` (must match content subject), `rotation_order`, `duration`.
6. **Public** `GET /api/public/live/:teacherId?subject=<normalized subject>` — `:teacherId` = content’s `uploaded_by` user id.

## API Reference

### Auth

| Method | Path | Body |
|--------|------|------|
| POST | `/api/auth/register` | `{ "name", "email", "password", "role": "teacher" \| "principal" }` |
| POST | `/api/auth/login` | `{ "email", "password" }` |

### Teacher (Bearer: teacher token)

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/content/upload` | `multipart/form-data`: `title`, `subject`, `file`; optional `description`, `start_time`, `end_time` |
| GET | `/api/content/my` | List own uploads |
| PATCH | `/api/content/:id/window` | JSON: `{ "start_time", "end_time" }` ISO or both `null` to clear |

### Principal (Bearer: principal token)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/approval/all` | All content |
| GET | `/api/approval/pending` | Pending only |
| PATCH | `/api/approval/approve/:id` | Pending → approved |
| PATCH | `/api/approval/reject/:id` | JSON: `{ "reason": "..." }` (required) |
| POST | `/api/schedule` | JSON: `{ "content_id", "subject", "rotation_order", "duration" }` — content must be **approved** |
| GET | `/api/schedule` | Optional `?subject=&teacherId=` (principal) |
| DELETE | `/api/schedule/:id` | Remove schedule row |

### Public (no auth)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/public/live/:teacherId` | Optional `?subject=maths` |

**Assignment wording** uses `/content/live/:teacherId`; this repo exposes **`/api/public/live/:teacherId`**.

## Postman Tips

- Paste the **entire** login `token` into Bearer (not only the last segment).
- Reject: **Body → raw → JSON** `{ "reason": "..." }` plus `Content-Type: application/json`.
- Upload: **Body → form-data**; add `start_time` / `end_time` as **Text** rows if needed.
- If you see **403** on principal routes, response JSON includes your token’s role; use principal login token.

## Submission Checklist (External)

- [ ] Public GitHub repository
- [ ] This README + `architecture-notes.txt`
- [ ] Demo video (3–7 min) — add link below
- [ ] Postman collection or Swagger — add link below
- [ ] Deployment URL (or state “runs locally only”)
- [ ] Submit via the organizer’s Google Form

**Postman collection:** _add your published link here_

**Deployment:** _add your URL here_

**Demo video:** _add Loom / Drive / YouTube link here_

## Bonus

- **S3 file storage** — implemented (optional via env vars above).
- Not implemented: Redis cache for `/api/public/live`, rate limiting, subject analytics, pagination filters.

## Assumptions

- Live eligibility requires **both** `start_time` and `end_time` on content and **now** inside that range.
- Live requires at least one **schedule** row for that content; approval alone is not enough.
- Supported upload types are **JPG, PNG, GIF** only (per assignment).
- Invalid teacher id on public live → `{ "message": "No content available" }` (not a hard error).
