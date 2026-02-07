import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  try {
    const r = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      return NextResponse.json({ error: "REST Countries error", details: txt }, { status: 502 });
    }
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: "REST Countries timeout/unreachable" }, { status: 504 });
  } finally {
    clearTimeout(t);
  }
}
