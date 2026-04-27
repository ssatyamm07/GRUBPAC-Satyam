# Grubpac

Teachers upload images. Principals approve or reject and add approved items to a per-subject broadcast schedule. `GET /api/public/live/:teacherId` (optional `?subject=`) returns what should be on screen now: rotation by slot duration, only if the content is approved, scheduled, and inside its `start_time` / `end_time`. Optional React app in `frontend/`.

Stack: Node (ESM), Express 5, PostgreSQL, Sequelize, JWT, bcrypt, multer (disk or S3).

## Run it

**API** (repo root):

```bash
cp .env.example .env
# PORT, DB_* or DATABASE_URL, JWT_SECRET (use DB_PASS for local DB password)

npm install
npm run db:reset
npm run db:seed   # optional
npm run dev       # listens on PORT from .env
```

**UI:**

```bash
cd frontend && npm install && npm run dev
```

Vite uses port 5173 and proxies `/api` to Express. Start the API first. If the API port differs from your root `.env` `PORT`, set `VITE_API_PROXY_TARGET` or `VITE_API_BASE` in `frontend/.env`.

**Vercel + Render:** Repo root `vercel.json` builds `frontend/` and rewrites `/api` and `/uploads` to Render (edit the host if it changes). If Vercel **Root Directory** is `frontend`, only `frontend/vercel.json` is used. Postman and server-to-server calls must use the **Render** URL (e.g. `https://…onrender.com/api/...`), not the Vercel URL.

**Docker Postgres:**

```bash
docker compose up -d
npm run db:reset
```

**Render:** In the dashboard use Blueprint from `render.yaml`, or create a Web Service with build `npm install`, start `npm start`, and env `DATABASE_URL` from your Render Postgres. Set `JWT_SECRET` yourself. After Postgres exists, run once (Shell with the same `DATABASE_URL`, or from your laptop): `npm run db:apply-schema`.

## Layout

```
src/routes  src/controllers  src/services  src/models  src/middlewares  src/config  src/utils
db/schema.sql  db/seed.sql
frontend/
```

## Flow

1. `POST /api/auth/register` and `POST /api/auth/login` for teacher and principal; send `Authorization: Bearer <jwt>` on protected routes.
2. Teacher: `POST /api/content/upload` (multipart: `title`, `subject`, `file`; optional description, `start_time`, `end_time`).
3. Principal: `PATCH /api/approval/approve/:id`.
4. If needed: teacher `PATCH /api/content/:id/window` with ISO times including now (UTC).
5. Principal: `POST /api/schedule` with `content_id`, `subject`, `rotation_order`, `duration` (minutes).
6. Public: `GET /api/public/live/:teacherId`, or `GET /api/public/live?teacher=...`, or list teachers / subjects via `GET /api/public/teachers` and `GET /api/public/teachers/:teacherId/subjects`.

Uploads: JPG, PNG, GIF, max 10 MB. Empty live: `{ "message": "No content available" }` when rules are not met.

## API

Base path `/api`. Bearer required except public routes below.

**Auth:** `POST /api/auth/register`, `POST /api/auth/login`

**Teacher:** `POST /api/content/upload`, `GET /api/content/my`, `PATCH /api/content/:id/window`

**Principal:** `GET /api/approval/all`, `GET /api/approval/pending`, `PATCH /api/approval/approve/:id`, `PATCH /api/approval/reject/:id` (body `{ "reason" }`), `POST /api/schedule`, `GET /api/schedule`, `DELETE /api/schedule/:id`

**Public:** `GET /api/public/teachers`, `GET /api/public/teachers/:teacherId/subjects`, `GET /api/public/live/:teacherId`, `GET /api/public/live?teacher=...`

More detail: `architecture-notes.txt`.
