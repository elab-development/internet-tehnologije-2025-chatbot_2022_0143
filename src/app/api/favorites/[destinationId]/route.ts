import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

function isAllowed(role: string | null) {
  return role === "REGISTROVANI_KORISNIK" || role === "ADMIN";
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ destinationId: string }> }
) {
  try {
    const { userId, role } = await getAuthFromRequest();
    const prisma = getPrisma();

    if (!userId) {
      return NextResponse.json({ message: "Niste ulogovani." }, { status: 401 });
    }

    if (!isAllowed(role)) {
      return NextResponse.json(
        { message: "Samo ulogovani korisnici mogu uklanjati omiljene." },
        { status: 403 }
      );
    }

    const { destinationId } = await context.params;

    const destIdNum = Number(destinationId);
    const idNum = Number(userId);

    if (Number.isNaN(destIdNum)) {
      return NextResponse.json(
        { message: "Neispravan destinationId." },
        { status: 400 }
      );
    }
    if (Number.isNaN(idNum)) {
      return NextResponse.json(
        { message: "Neispravan userId." },
        { status: 400 }
      );
    }

    const fav = await prisma.favorite.findFirst({
      where: { userId: idNum, destinationId: destIdNum },
    });

    if (!fav) {
      return NextResponse.json({ message: "Nije u omiljenima." }, { status: 404 });
    }

    await prisma.favorite.delete({ where: { id: fav.id } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("GREŠKA PRI BRISANJU OMILJENOG:", err);
    return NextResponse.json(
      {
        message: "Greška pri brisanju omiljenog.",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
