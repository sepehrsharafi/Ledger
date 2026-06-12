import { handleRecordRequest } from "@/backend/api";

export async function GET(request, { params }) {
  return await handleRecordRequest(params.entity, params.recordId, request);
}

export async function PATCH(request, { params }) {
  return await handleRecordRequest(params.entity, params.recordId, request);
}

export async function DELETE(request, { params }) {
  return await handleRecordRequest(params.entity, params.recordId, request);
}
