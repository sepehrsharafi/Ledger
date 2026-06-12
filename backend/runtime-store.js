import fs from "node:fs";
import path from "node:path";
import { createBackendSeed } from "./seed.js";
import { applyDefaults, buildRecordIdentity, getBackendCollectionConfig, getRecordIdentity, isBackendCollection, parseRecordIdentity, validatePayload } from "./catalog.js";

const runtimeStorePath = path.join(process.cwd(), "backend", "runtime-data.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeStoreWithSeed(currentStore) {
  const seed = createBackendSeed();
  const nextStore = { ...seed, ...currentStore };

  for (const [key, seedValue] of Object.entries(seed)) {
    if (!(key in currentStore)) {
      nextStore[key] = seedValue;
      continue;
    }

    const currentValue = currentStore[key];
    if (Array.isArray(seedValue) && Array.isArray(currentValue)) {
      const seedRecordsById = new Map(seedValue.map((record) => [getRecordIdentity(key, record), record]));
      const mergedCurrentRecords = currentValue.map((record) => {
        const seedRecord = seedRecordsById.get(getRecordIdentity(key, record));
        return seedRecord ? { ...seedRecord, ...record } : record;
      });
      const currentIds = new Set(mergedCurrentRecords.map((record) => getRecordIdentity(key, record)));
      const missingSeedRecords = seedValue.filter((record) => !currentIds.has(getRecordIdentity(key, record)));
      nextStore[key] = [...mergedCurrentRecords, ...missingSeedRecords];
      continue;
    }

    if (!Array.isArray(seedValue) && seedValue && typeof seedValue === "object") {
      nextStore[key] = { ...seedValue, ...(currentValue || {}) };
    }
  }

  return nextStore;
}

function readRuntimeStore() {
  if (!fs.existsSync(runtimeStorePath)) {
    return createBackendSeed();
  }

  const raw = fs.readFileSync(runtimeStorePath, "utf8");
  if (!raw.trim()) {
    return createBackendSeed();
  }

  return mergeStoreWithSeed(JSON.parse(raw));
}

function writeRuntimeStore(store) {
  fs.writeFileSync(runtimeStorePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function withStore(mutator) {
  const store = readRuntimeStore();
  const result = mutator(store);
  writeRuntimeStore(store);
  return result;
}

function listCollection(store, collection) {
  const value = store[collection];
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value === "object") {
    return [value];
  }
  return [];
}

function setCollection(store, collection, records) {
  const config = getBackendCollectionConfig(collection);
  if (config.singleton) {
    store[collection] = records[0] || null;
    return;
  }
  store[collection] = records;
}

export function getRuntimeSnapshot() {
  return clone(readRuntimeStore());
}

export function getCollectionRecords(collection) {
  if (!isBackendCollection(collection)) {
    throw new Error(`Unknown backend collection: ${collection}`);
  }
  return clone(listCollection(readRuntimeStore(), collection));
}

export function getRecord(collection, recordId) {
  const store = readRuntimeStore();
  const records = listCollection(store, collection);
  const config = getBackendCollectionConfig(collection);
  if (config.singleton) {
    return clone(records[0] || null);
  }

  const matcher = config.key
    ? (record) => record[config.key] === recordId
    : (record) => {
        const identity = getRecordIdentity(collection, record);
        return identity === recordId;
      };

  return clone(records.find(matcher) || null);
}

export function createRecord(collection, payload) {
  return withStore((store) => {
    const config = getBackendCollectionConfig(collection);
    if (config.singleton) {
      const existing = listCollection(store, collection)[0];
      const nextRecord = applyDefaults(collection, { ...(existing || {}), ...payload });
      setCollection(store, collection, [nextRecord]);
      return clone(nextRecord);
    }

    const missing = validatePayload(collection, payload);
    if (missing.length) {
      const error = new Error(`Missing required fields: ${missing.join(", ")}`);
      error.status = 400;
      throw error;
    }

    const record = applyDefaults(collection, { ...payload });
    if (config.key && !record[config.key]) {
      record[config.key] = buildRecordIdentity(collection, record);
    }

    const records = listCollection(store, collection);
    const identity = getRecordIdentity(collection, record);
    const alreadyExists = records.some((item) => getRecordIdentity(collection, item) === identity);
    if (alreadyExists) {
      const error = new Error(`Record already exists: ${identity}`);
      error.status = 409;
      throw error;
    }

    records.unshift(record);
    setCollection(store, collection, records);
    return clone(record);
  });
}

export function updateRecord(collection, recordId, payload) {
  return withStore((store) => {
    const config = getBackendCollectionConfig(collection);
    const records = listCollection(store, collection);
    const index = records.findIndex((record) =>
      config.key ? record[config.key] === recordId : getRecordIdentity(collection, record) === recordId
    );

    if (index === -1) {
      return null;
    }

    const current = records[index];
    const merged = applyDefaults(collection, { ...current, ...payload });
    if (config.key) {
      merged[config.key] = current[config.key];
    }

    if (!config.key) {
      const composite = parseRecordIdentity(collection, recordId);
      for (const [field, value] of Object.entries(composite)) {
        merged[field] = value;
      }
    }

    records[index] = merged;
    setCollection(store, collection, records);
    return clone(merged);
  });
}

export function deleteRecord(collection, recordId) {
  return withStore((store) => {
    const config = getBackendCollectionConfig(collection);
    const records = listCollection(store, collection);
    const nextRecords = records.filter((record) =>
      config.key ? record[config.key] !== recordId : getRecordIdentity(collection, record) !== recordId
    );

    if (nextRecords.length === records.length) {
      return false;
    }

    setCollection(store, collection, nextRecords);
    return true;
  });
}

export function listRecords(collection) {
  return getCollectionRecords(collection);
}

export function getBackendCollections() {
  return Object.keys(getRuntimeSnapshot());
}
