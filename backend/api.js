import { NextResponse } from "next/server";
import { backendCollectionConfig, isBackendCollection } from "./catalog.js";
import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from "./postgres-store.js";

function json(body, status = 200) {
  return NextResponse.json(body, { status });
}

export function listApiRoots() {
  return {
    collections: Object.keys(backendCollectionConfig),
    endpoints: Object.keys(backendCollectionConfig).map((name) => ({
      collection: name,
      list: `/api/${name}`,
      record: `/api/${name}/{recordId}`,
    })),
  };
}

export async function handleCollectionRequest(collection, request) {
  if (!isBackendCollection(collection)) {
    return json({ error: "Unknown collection" }, 404);
  }

  if (request.method === "GET") {
    try {
      return json({ collection, records: await listRecords(collection) });
    } catch (error) {
      return json({ error: error.message }, error.status || 500);
    }
  }

  if (request.method === "POST") {
    try {
      const payload = await request.json();
      const record = await createRecord(collection, payload);
      return json({ collection, record }, 201);
    } catch (error) {
      return json({ error: error.message }, error.status || 500);
    }
  }

  return json({ error: "Method not allowed" }, 405);
}

export async function handleRecordRequest(collection, recordId, request) {
  if (!isBackendCollection(collection)) {
    return json({ error: "Unknown collection" }, 404);
  }

  if (request.method === "GET") {
    try {
      const record = await getRecord(collection, recordId);
      return record ? json({ collection, record }) : json({ error: "Not found" }, 404);
    } catch (error) {
      return json({ error: error.message }, error.status || 500);
    }
  }

  if (request.method === "PATCH") {
    try {
      const payload = await request.json();
      const record = await updateRecord(collection, recordId, payload);
      return record ? json({ collection, record }) : json({ error: "Not found" }, 404);
    } catch (error) {
      return json({ error: error.message }, error.status || 500);
    }
  }

  if (request.method === "DELETE") {
    try {
      const deleted = await deleteRecord(collection, recordId);
      return deleted ? json({ ok: true }) : json({ error: "Not found" }, 404);
    } catch (error) {
      return json({ error: error.message }, error.status || 500);
    }
  }

  return json({ error: "Method not allowed" }, 405);
}

export function handleApiRoot() {
  return json({
    ok: true,
    source: "database",
    collections: listApiRoots().collections,
    routes: listApiRoots().endpoints,
  });
}
