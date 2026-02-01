import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ destinationId: string }> }
) {
  const { userId, role } = await getAuthFromRequest();

  if (!userId) {
    return NextResponse.json({ message: "Niste ulogovani." }, { status: 401 });
  }

  if (role !== "REGISTROVANI_KORISNIK") {
    return NextResponse.json(
      { message: "Samo registrovani korisnici mogu uklanjati omiljene." },
      { status: 403 }
    );
  }

  const { destinationId } = await context.params;
  const destIdNum = Number(destinationId);
  const idNum = Number(userId);

  if (Number.isNaN(destIdNum)) {
    return NextResponse.json({ message: "Neispravan destinationId." }, { status: 400 });
  }

  
  const fav = await prisma.favorite.findFirst({
    where: { userId: idNum, destinationId: destIdNum },
  });

  if (!fav) {
    return NextResponse.json({ message: "Nije u omiljenima." }, { status: 404 });
  }

  await prisma.favorite.delete({ where: { id: fav.id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
