import { db } from "./db.js";
import { backendEntityNames } from "./entities.js";
import {
  applyDefaults,
  buildRecordIdentity,
  getBackendCollectionConfig,
  getRecordIdentity,
  isBackendCollection,
  parseRecordIdentity,
  validatePayload,
} from "./catalog.js";

function formatTimestamp(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

function formatDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

function parseJson(value) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeValue(collection, field, value) {
  if (value === null || value === undefined) {
    return value;
  }

  const config = getBackendCollectionConfig(collection);

  if ((config.jsonFields || []).includes(field)) {
    return parseJson(value);
  }

  if ((config.numericFields || []).includes(field)) {
    return Number(value);
  }

  if ((config.dateFields || []).includes(field)) {
    return formatDate(value);
  }

  if ((config.timestampFields || []).includes(field) || field.endsWith("At")) {
    return typeof value === "string" && value.length === 10 ? value : formatTimestamp(value);
  }

  return value;
}

function mapRowToRecord(collection, row) {
  const config = getBackendCollectionConfig(collection);
  return Object.fromEntries(
    Object.entries(config.columns).map(([field, column]) => [
      field,
      normalizeValue(collection, field, row[column]),
    ])
  );
}

function getFieldExpression(field, column, value, index, config) {
  if ((config.jsonFields || []).includes(field)) {
    return `${column} = $${index}::jsonb`;
  }
  return `${column} = $${index}`;
}

function getInsertValueExpression(field, index, config) {
  if ((config.jsonFields || []).includes(field)) {
    return `$${index}::jsonb`;
  }
  return `$${index}`;
}

function mapRecordToParams(collection, record, fields) {
  const config = getBackendCollectionConfig(collection);
  return fields.map((field) => {
    const value = record[field];
    if ((config.jsonFields || []).includes(field)) {
      return JSON.stringify(value);
    }
    return value;
  });
}

function buildWhereClause(collection, recordId, startIndex = 1) {
  const config = getBackendCollectionConfig(collection);
  if (config.key) {
    return {
      clause: `${config.columns[config.key]} = $${startIndex}`,
      params: [recordId],
    };
  }

  const composite = parseRecordIdentity(collection, recordId);
  const fields = Object.keys(composite);
  return {
    clause: fields.map((field, index) => `${config.columns[field]} = $${startIndex + index}`).join(" and "),
    params: fields.map((field) => composite[field]),
  };
}

async function queryRows(query, params = []) {
  return db.unsafe(query, params);
}

export async function getRuntimeSnapshot() {
  const snapshot = {};

  for (const collection of backendEntityNames) {
    const records = await getCollectionRecords(collection);
    const config = getBackendCollectionConfig(collection);
    snapshot[collection] = config.singleton ? records[0] || null : records;
  }

  return snapshot;
}

export async function getCollectionRecords(collection) {
  if (!isBackendCollection(collection)) {
    throw new Error(`Unknown backend collection: ${collection}`);
  }

  const config = getBackendCollectionConfig(collection);
  const rows = await queryRows(`select * from ${config.table}`);
  return rows.map((row) => mapRowToRecord(collection, row));
}

export async function getRecord(collection, recordId) {
  const config = getBackendCollectionConfig(collection);
  if (config.singleton) {
    const rows = await getCollectionRecords(collection);
    return rows[0] || null;
  }

  const where = buildWhereClause(collection, recordId);
  const rows = await queryRows(`select * from ${config.table} where ${where.clause} limit 1`, where.params);
  return rows[0] ? mapRowToRecord(collection, rows[0]) : null;
}

export async function createRecord(collection, payload) {
  const config = getBackendCollectionConfig(collection);

  if (config.singleton) {
    const existing = await getCollectionRecords(collection);
    if (existing[0]) {
      return updateRecord(collection, existing[0].id, payload);
    }
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

  const fields = Object.keys(config.columns);
  const params = mapRecordToParams(collection, record, fields);
  const columnsSql = fields.map((field) => config.columns[field]).join(", ");
  const valuesSql = fields.map((field, index) => getInsertValueExpression(field, index + 1, config)).join(", ");
  const rows = await queryRows(
    `insert into ${config.table} (${columnsSql}) values (${valuesSql}) returning *`,
    params
  );
  return mapRowToRecord(collection, rows[0]);
}

export async function updateRecord(collection, recordId, payload) {
  const config = getBackendCollectionConfig(collection);
  const current = await getRecord(collection, recordId);

  if (!current) {
    return null;
  }

  const merged = applyDefaults(collection, { ...current, ...payload });
  if (config.key) {
    merged[config.key] = current[config.key];
  } else {
    Object.assign(merged, parseRecordIdentity(collection, recordId));
  }

  const fields = Object.keys(config.columns).filter((field) => {
    if (config.key && field === config.key) {
      return false;
    }
    return !(config.compositeKey || []).includes(field);
  });
  const params = mapRecordToParams(collection, merged, fields);
  const assignments = fields
    .map((field, index) => getFieldExpression(field, config.columns[field], merged[field], index + 1, config))
    .join(", ");
  const where = buildWhereClause(collection, recordId, fields.length + 1);
  const rows = await queryRows(
    `update ${config.table} set ${assignments} where ${where.clause} returning *`,
    [...params, ...where.params]
  );
  return rows[0] ? mapRowToRecord(collection, rows[0]) : null;
}

export async function deleteRecord(collection, recordId) {
  const config = getBackendCollectionConfig(collection);
  const where = buildWhereClause(collection, recordId);
  const rows = await queryRows(`delete from ${config.table} where ${where.clause} returning *`, where.params);
  return rows.length > 0;
}

export async function listRecords(collection) {
  return getCollectionRecords(collection);
}

export async function truncateAllCollections() {
  const tables = backendEntityNames.map((collection) => getBackendCollectionConfig(collection).table);
  await queryRows(`truncate table ${tables.join(", ")} restart identity cascade`);
}

export async function insertMany(collection, records) {
  const config = getBackendCollectionConfig(collection);
  if (config.singleton) {
    if (records[0]) {
      await createRecord(collection, records[0]);
    }
    return;
  }

  const fields = Object.keys(config.columns);
  const chunkSize = 100;

  for (let offset = 0; offset < records.length; offset += chunkSize) {
    const chunk = records.slice(offset, offset + chunkSize).map((input) => {
      const record = applyDefaults(collection, { ...input });
      if (config.key && !record[config.key]) {
        record[config.key] = buildRecordIdentity(collection, record);
      }
      return record;
    });

    const params = chunk.flatMap((record) => mapRecordToParams(collection, record, fields));
    const valuesSql = chunk
      .map((_, rowIndex) => {
        const base = rowIndex * fields.length;
        return `(${fields
          .map((field, fieldIndex) => getInsertValueExpression(field, base + fieldIndex + 1, config))
          .join(", ")})`;
      })
      .join(", ");

    await queryRows(
      `insert into ${config.table} (${fields.map((field) => config.columns[field]).join(", ")}) values ${valuesSql}`,
      params
    );
  }
}
