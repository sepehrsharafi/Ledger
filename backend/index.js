import { getRuntimeSnapshot } from "./postgres-store.js";

export { backendEntities, backendEntityNames } from "./entities.js";
export { createBackendSeed } from "./seed.js";

export async function createBackendSnapshot() {
  return {
    source: "database",
    generatedAt: new Date().toISOString(),
    seed: await getRuntimeSnapshot(),
  };
}
