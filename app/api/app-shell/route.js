import { NextResponse } from "next/server";
import { getAppShellView } from "@/backend/project-views";

function json(body, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  try {
    return json(await getAppShellView());
  } catch (error) {
    return json({ error: error.message }, error.status || 500);
  }
}
