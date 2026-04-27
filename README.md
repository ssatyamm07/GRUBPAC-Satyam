# Content Broadcasting Backend

Backend service for subject-based content broadcasting in educational workflows.

## Tech Stack

- Node.js + Express
- PostgreSQL
- Sequelize ORM
- JWT (`jsonwebtoken`) for auth
- `bcrypt` for password hashing
- `multer` for file upload

## Features Implemented

- JWT authentication (`teacher`, `principal`)
- Role-based authorization middleware
- Teacher upload API (JPG/PNG/GIF, max 10MB)
- Principal approval and rejection workflow
- Public live API by teacher with schedule-based rotation
- Time-window eligibility (`start_time`, `end_time`)

## Project Structure

src/
- controllers/
- routes/
- services/
- middlewares/
- models/
- config/
- utils/

## Environment Variables

Create `.env`:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grubpac
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret
```

## Setup

1. Install dependencies

```bash
npm install
```

2. Reset schema and seed data

```bash
npm run db:reset
npm run db:seed
```

3. Start server

```bash
npm run dev
```

## Docker (if using local Postgres container)

```bash
docker compose up -d
```

Then run DB scripts:

```bash
npm run db:reset
npm run db:seed
```

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Teacher Content
- `POST /api/content/upload` (multipart/form-data)
- `GET /api/content/my`

### Principal Approval
- `GET /api/approval/all`
- `GET /api/approval/pending`
- `PATCH /api/approval/approve/:id`
- `PATCH /api/approval/reject/:id`

### Public Broadcast
- `GET /api/public/live/:teacherId`
- Optional query: `subject` (example: `/api/public/live/1?subject=maths`)

Note: The assignment examples use `/content/live/:teacherId`. In this implementation, the equivalent public route is namespaced as `/api/public/live/:teacherId`.

## Postman Collection

Add your Postman collection link here before submission.

## Deployment

Add your deployment link here before submission.

## Bonus Features (Optional)

- Redis cache for live endpoint
- Rate limiting for public endpoint
- S3 file storage

## Assumptions

- Content without full `start_time` + `end_time` is not considered live.
- Invalid teacher ID or invalid/empty subject match on public API returns:
  - `{ "message": "No content available" }`
