import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const { db } = await import("./db.js");

const migrationsDir = path.join(process.cwd(), "backend", "migrations");

async function ensureMigrationsTable() {
  await db.unsafe(`
    create table if not exists schema_migrations (
      id text primary key,
      executed_at timestamptz not null default now()
    )
  `);
}

async function getExecutedMigrations() {
  const rows = await db.unsafe("select id from schema_migrations");
  return new Set(rows.map((row) => row.id));
}

async function run() {
  await ensureMigrationsTable();
  const executed = await getExecutedMigrations();
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    if (executed.has(file)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await db.begin(async (tx) => {
      await tx.unsafe(sql);
      await tx.unsafe("insert into schema_migrations (id) values ($1)", [file]);
    });
    console.log(`applied ${file}`);
  }
}

run()
  .then(async () => {
    await db.end({ timeout: 0 });
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await db.end({ timeout: 0 });
    process.exit(1);
  });
