import { NextResponse } from "next/server";
import { getProjectLeadsListView } from "@/backend/project-views";

function json(body, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET(request, context) {
  const { projectId } = await context.params;
  const searchParams = new URL(request.url).searchParams;

  try {
    return json(
      await getProjectLeadsListView(projectId, {
        q: searchParams.get("q") || "",
        status: searchParams.get("status") || "",
        source: searchParams.get("source") || "",
        assignee: searchParams.get("assignee") || "",
      }),
    );
  } catch (error) {
    return json({ error: error.message }, error.status || 500);
  }
}
