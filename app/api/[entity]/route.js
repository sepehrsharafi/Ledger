import { handleCollectionRequest } from "@/backend/api";

export async function GET(request, context) {
  const { entity } = await context.params;
  return await handleCollectionRequest(entity, request);
}

export async function POST(request, context) {
  const { entity } = await context.params;
  return await handleCollectionRequest(entity, request);
}
