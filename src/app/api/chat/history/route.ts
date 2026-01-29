// src/app/api/chat/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { userId, role } = await getAuthFromRequest();

    if (!userId || (role !== "ADMIN" && role !== "REGISTROVANI_KORISNIK")) {
      return NextResponse.json({ message: "Niste prijavljeni." }, { status: 401 });
    }

    const idNum = Number(userId);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ message: "Neispravan userId." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 200);

    const rows = await prisma.chatHistory.findMany({
      where: { userId: idNum },          // ✅ samo njegova istorija (i admin i registrovani)
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(rows, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("GET /api/chat/history error:", err);
    return NextResponse.json({ message: "Greška na serveru." }, { status: 500 });
  }
}
