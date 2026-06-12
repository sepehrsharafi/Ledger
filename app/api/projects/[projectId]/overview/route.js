import { NextResponse } from "next/server";
import { getProjectOverviewView } from "@/backend/project-views";

function json(body, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET(_request, context) {
  const { projectId } = await context.params;

  try {
    return json(await getProjectOverviewView(projectId));
  } catch (error) {
    return json({ error: error.message }, error.status || 500);
  }
}
