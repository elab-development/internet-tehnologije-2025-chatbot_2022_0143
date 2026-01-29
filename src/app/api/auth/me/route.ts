import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await getAuthFromRequest();

    if (!userId) {
      return NextResponse.json({ user: null, roleName: null }, { status: 200 });
    }

    const idNum = Number(userId);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ user: null, roleName: null }, { status: 200 });
    }

    // Učitaj user-a (bez oslanjanja na naziv relacije "role")
    const user = await prisma.user.findUnique({
      where: { id: idNum },
      select: {
        id: true,
        email: true,
        roleId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null, roleName: null }, { status: 200 });
    }

    // Nađi naziv uloge preko roleId
    const role = await prisma.role.findUnique({
      where: { id: user.roleId },
      select: { name: true },
    });

    const roleName = role?.name ?? null;

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          roleName,
        },
        roleName,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json(
      { user: null, roleName: null, message: "Greška na serveru." },
      { status: 500 }
    );
  }
}
