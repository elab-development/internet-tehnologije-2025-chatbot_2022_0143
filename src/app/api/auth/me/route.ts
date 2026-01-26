import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET() {
  const { userId } = await getAuthFromRequest();

  // Ako nema userId → nije ulogovan
  if (!userId) {
    return NextResponse.json(
      { user: null, roleName: null },
      { status: 200 }
    );
  }

  const idNum = Number(userId);

  // Ako cookie nije validan broj → tretiraj kao neulogovan
  if (Number.isNaN(idNum)) {
    return NextResponse.json(
      { user: null, roleName: null },
      { status: 200 }
    );
  }

  // Učitaj user-a zajedno sa ulogom
  const user = await prisma.user.findUnique({
    where: { id: idNum },
    select: {
      id: true,
      email: true,
      role: {
        select: { name: true }, // Role.name = "USER" | "ADMIN"
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { user: null, roleName: null },
      { status: 200 }
    );
  }

  const roleName = user.role?.name ?? "USER";

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
        "Cache-Control": "no-store", // VAŽNO: sprečava keširanje i flicker
      },
    }
  );
}
