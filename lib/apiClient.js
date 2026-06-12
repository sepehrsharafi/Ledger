const inflightRequests = new Map();

function buildRequestKey(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const body = typeof options.body === "string" ? options.body : "";
  return `${method}:${path}:${body}`;
}

async function request(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const requestKey = buildRequestKey(path, options);

  if (method === "GET" && inflightRequests.has(requestKey)) {
    return inflightRequests.get(requestKey);
  }

  const fetchPromise = (async () => {
    const response = await fetch(path, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  })();

  if (method === "GET") {
    inflightRequests.set(requestKey, fetchPromise);
  }

  try {
    return await fetchPromise;
  } finally {
    if (method === "GET") {
      inflightRequests.delete(requestKey);
    }
  }
}

export async function fetchJson(path, options = {}) {
  return request(path, options);
}

export async function fetchBootstrap() {
  const payload = await request("/api/bootstrap");
  return payload.seed;
}

export async function fetchCollection(entity, filters = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  const payload = await request(`/api/${entity}${query ? `?${query}` : ""}`);
  return payload.records;
}

export async function fetchRecord(entity, recordId) {
  const payload = await request(`/api/${entity}/${encodeURIComponent(recordId)}`);
  return payload.record;
}

export async function createEntity(entity, body) {
  const payload = await request(`/api/${entity}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload.record;
}

export async function updateEntity(entity, recordId, body) {
  const payload = await request(`/api/${entity}/${encodeURIComponent(recordId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return payload.record;
}

export async function deleteEntity(entity, recordId) {
  await request(`/api/${entity}/${encodeURIComponent(recordId)}`, {
    method: "DELETE",
  });
}
