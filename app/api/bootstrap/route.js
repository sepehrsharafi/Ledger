import { NextResponse } from "next/server";
import { createBackendSnapshot } from "@/backend";

export async function GET() {
  return NextResponse.json(await createBackendSnapshot());
}
