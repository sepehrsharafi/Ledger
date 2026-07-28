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

// Values reach these either as driver `Date` objects or, when a row came back
// inside a json aggregate, as Postgres date/timestamp strings. Both must
// normalize to the same shape or records would differ by query style.
function formatTimestamp(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string" && value.length > 10) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }
  return value;
}

function formatDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
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

function buildFilterClause(collection, filters = {}, startIndex = 1) {
  const config = getBackendCollectionConfig(collection);
  const entries = Object.entries(filters).filter(
    ([field, value]) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      Object.prototype.hasOwnProperty.call(config.columns, field),
  );

  if (!entries.length) {
    return { clause: "", params: [] };
  }

  return {
    clause: ` where ${entries
      .map(([field], index) => `${config.columns[field]} = $${startIndex + index}`)
      .join(" and ")}`,
    params: entries.map(([, value]) => value),
  };
}

/**
 * Reads the whole overview in a single round trip.
 *
 * Measured against the Neon pooler: a parameterized query costs ~250ms and
 * several of them do not pipeline — eight cost ~2s, the same eight collapsed into
 * one json query cost about as much as one. That is why this view is hand-written
 * SQL instead of eight `getCollectionRecords` calls. Ordering and limiting happen
 * in the database, and rows still come back through the catalog's mappers so the
 * records are identical in shape to every other read.
 */
export async function getProjectOverviewRows(projectId) {
  const [row] = await queryRows(
    `select
       (select row_to_json(p) from projects p where p.id = $1) as project,
       (select coalesce(json_agg(row_to_json(k)), '[]'::json)
          from kpi_snapshots k where k.project_id = $1) as kpis,
       (select coalesce(json_agg(row_to_json(s)), '[]'::json)
          from (select * from time_series
                 where project_id = $1 order by month_start asc) s) as series,
       (select coalesce(json_agg(row_to_json(c)), '[]'::json)
          from campaigns c where c.project_id = $1) as campaigns,
       (select coalesce(json_agg(row_to_json(t)), '[]'::json)
          from (select * from tasks
                 where project_id = $1 order by due_date asc limit 6) t) as upcoming_tasks,
       (select coalesce(json_agg(row_to_json(a)), '[]'::json)
          from (select * from lead_activities
                 where project_id = $1 order by created_at desc limit 5) a) as recent_activity,
       (select coalesce(json_object_agg(status, total), '{}'::json)
          from (select status, count(*)::int as total from leads
                 where project_id = $1 group by status) g) as lead_status_counts,
       (select coalesce(json_agg(row_to_json(m)), '[]'::json)
          from team_members m) as team_members`,
    [projectId],
  );

  const list = (collection, rows) =>
    (rows || []).map((item) => mapRowToRecord(collection, item));

  return {
    project: row.project ? mapRowToRecord("projects", row.project) : null,
    kpis: list("kpiSnapshots", row.kpis),
    series: list("timeSeries", row.series),
    campaigns: list("campaigns", row.campaigns),
    upcomingTasks: list("tasks", row.upcoming_tasks),
    recentActivity: list("leadActivities", row.recent_activity),
    leadStatusCounts: row.lead_status_counts || {},
    teamMembers: list("teamMembers", row.team_members),
  };
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

export async function getCollectionRecords(collection, filters = {}) {
  if (!isBackendCollection(collection)) {
    throw new Error(`Unknown backend collection: ${collection}`);
  }

  const config = getBackendCollectionConfig(collection);
  const where = buildFilterClause(collection, filters);
  const rows = await queryRows(`select * from ${config.table}${where.clause}`, where.params);
  return rows.map((row) => mapRowToRecord(collection, row));
}

/**
 * Counts rows grouped by one field. Used for the sidebar's per-module tallies,
 * where pulling whole collections just to call `.length` would be wasteful.
 */
export async function getGroupedCounts(collection, groupField, filters = {}) {
  if (!isBackendCollection(collection)) {
    throw new Error(`Unknown backend collection: ${collection}`);
  }

  const config = getBackendCollectionConfig(collection);
  const column = config.columns[groupField];
  if (!column) {
    throw new Error(`Unknown ${collection} field: ${groupField}`);
  }

  const where = buildFilterClause(collection, filters);
  const rows = await queryRows(
    `select ${column} as group_key, count(*)::int as total from ${config.table}${where.clause} group by ${column}`,
    where.params,
  );

  return Object.fromEntries(rows.map((row) => [row.group_key, Number(row.total)]));
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

export async function listRecords(collection, filters = {}) {
  return getCollectionRecords(collection, filters);
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
