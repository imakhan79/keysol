// Applies pending SQL migrations from supabase/migrations to DATABASE_URL.
// Uses the same history table as the Supabase CLI, so `supabase migration list`
// and `supabase db push` stay in sync with what this script applied.
//
//   npm run db:migrate            apply pending migrations
//   npm run db:migrate -- --list  show applied / pending

import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const dir = path.resolve("supabase/migrations");
const listOnly = process.argv.includes("--list");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (see .env.example)");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

try {
  await client.query(`
    create schema if not exists supabase_migrations;
    create table if not exists supabase_migrations.schema_migrations (
      version text primary key,
      statements text[],
      name text
    );
  `);

  const { rows } = await client.query("select version from supabase_migrations.schema_migrations");
  const applied = new Set(rows.map((r) => r.version));
  const files = (await readdir(dir)).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();

  for (const file of files) {
    const [, version, name] = file.match(/^(\d+)_(.+)\.sql$/);
    if (applied.has(version)) {
      if (listOnly) console.log(`applied  ${file}`);
      continue;
    }
    if (listOnly) {
      console.log(`pending  ${file}`);
      continue;
    }
    const sql = await readFile(path.join(dir, file), "utf8");
    console.log(`applying ${file}`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(
        "insert into supabase_migrations.schema_migrations (version, name, statements) values ($1, $2, $3)",
        [version, name, [sql]],
      );
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw new Error(`${file}: ${error.message}`);
    }
  }
  if (!listOnly) console.log("migrations up to date");
} finally {
  await client.end();
}
