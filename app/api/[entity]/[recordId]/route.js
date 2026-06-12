import { handleRecordRequest } from "@/backend/api";

export async function GET(request, context) {
  const { entity, recordId } = await context.params;
  return await handleRecordRequest(entity, recordId, request);
}

export async function PATCH(request, context) {
  const { entity, recordId } = await context.params;
  return await handleRecordRequest(entity, recordId, request);
}

export async function DELETE(request, context) {
  const { entity, recordId } = await context.params;
  return await handleRecordRequest(entity, recordId, request);
}
