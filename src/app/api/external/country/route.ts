import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`;
  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json();

  return NextResponse.json(data);
}
