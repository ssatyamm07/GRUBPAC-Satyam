import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL?.trim();

if (!url) {
  console.error('Set DATABASE_URL (e.g. from Render Postgres).');
  process.exit(1);
}

const isRenderInternal = url.includes('.render.internal');
const useSsl =
  !isRenderInternal &&
  process.env.DATABASE_SSL !== 'false' &&
  (process.env.DATABASE_SSL === 'true' ||
    url.includes('render.com') ||
    url.includes('amazonaws.com'));

const client = new pg.Client({
  connectionString: url,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
const sql = fs.readFileSync(schemaPath, 'utf8');

async function main() {
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('Applied db/schema.sql');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
