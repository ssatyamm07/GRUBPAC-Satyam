# Grubpac React demo UI

Vite + React SPA that talks to the Express API.

## Dev (recommended)

1. Start the backend from the **repo root** (e.g. `npm run dev` on port `5000`).
2. In this folder:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server **proxies** `/api` to `http://localhost:5000`.

To point at another API origin, create `frontend/.env`:

```env
VITE_API_BASE=http://localhost:5006
```

Then requests go to that host instead of the proxy (you may need CORS enabled on the API).

## Build

```bash
npm run build
```

Static output is in `dist/`. You can serve it with any static host or configure Express to serve `dist/` in production.
