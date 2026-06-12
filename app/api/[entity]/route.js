import { handleCollectionRequest } from "@/backend/api";

export async function GET(request, { params }) {
  return await handleCollectionRequest(params.entity, request);
}

export async function POST(request, { params }) {
  return await handleCollectionRequest(params.entity, request);
}
