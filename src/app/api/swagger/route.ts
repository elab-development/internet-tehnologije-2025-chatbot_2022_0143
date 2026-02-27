import { NextResponse } from "next/server";
import { getSwaggerSpec } from "@/lib/swagger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getSwaggerSpec());
}
