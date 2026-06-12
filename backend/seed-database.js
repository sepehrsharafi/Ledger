import dotenv from "dotenv";

dotenv.config();

const [{ createBackendSeed }, { backendEntityNames }, { db }, { getBackendCollectionConfig }, { insertMany, truncateAllCollections }] =
  await Promise.all([
    import("./seed.js"),
    import("./entities.js"),
    import("./db.js"),
    import("./catalog.js"),
    import("./postgres-store.js"),
  ]);

async function run() {
  const seed = createBackendSeed();
  await db.unsafe("select pg_advisory_lock(424242)");

  try {
    await truncateAllCollections();

    for (const collection of backendEntityNames) {
      const config = getBackendCollectionConfig(collection);
      const records = config.singleton ? [seed[collection]].filter(Boolean) : seed[collection];
      await insertMany(collection, records);
    }
  } finally {
    await db.unsafe("select pg_advisory_unlock(424242)");
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
