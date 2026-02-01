import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = ["http://localhost:3000"]; // dodaj prod domen kad deployujete

export const config = {
  matcher: ["/api/:path*"],
};

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");

  // ✅ CSRF basic: za state-changing metode blokiraj cross-site origin
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json({ message: "CSRF blocked" }, { status: 403 });
    }
  }

  const res = NextResponse.next();

  // ✅ CORS
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }

  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: res.headers });
  }

  return res;
}
