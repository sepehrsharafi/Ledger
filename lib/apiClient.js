async function request(path, options = {}) {
  const response = await fetch(path, {
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
}

export async function fetchBootstrap() {
  const payload = await request("/api/bootstrap");
  return payload.seed;
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
