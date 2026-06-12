import postgres from "postgres";

function createClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return postgres(connectionString, {
    ssl: "require",
    max: 1,
    prepare: false,
  });
}

const globalForDb = globalThis;

export const db = globalForDb.__ledgerDbClient || createClient();

if (!globalForDb.__ledgerDbClient) {
  globalForDb.__ledgerDbClient = db;
}
