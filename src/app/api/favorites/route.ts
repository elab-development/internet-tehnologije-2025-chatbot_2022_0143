import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET() {
  const { userId, role } = await getAuthFromRequest();

  if (!userId) {
    return NextResponse.json({ message: "Niste ulogovani." }, { status: 401 });
  }

  if (role !== "REGISTROVANI_KORISNIK") {
    return NextResponse.json(
      { message: "Samo registrovani korisnici mogu imati omiljene." },
      { status: 403 }
    );
  }

  const idNum = Number(userId);
  const favorites = await prisma.favorite.findMany({
    where: { userId: idNum },
    include: { destination: true },
    orderBy: { id: "desc" },
  });

  
  return NextResponse.json(favorites.map(f => f.destination), {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  const { userId, role } = await getAuthFromRequest();

  if (!userId) {
    return NextResponse.json({ message: "Niste ulogovani." }, { status: 401 });
  }

  if (role !== "REGISTROVANI_KORISNIK") {
    return NextResponse.json(
      { message: "Samo registrovani korisnici mogu dodavati omiljene." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const destinationId = Number(body?.destinationId);

  if (!destinationId || Number.isNaN(destinationId)) {
    return NextResponse.json({ message: "Neispravan destinationId." }, { status: 400 });
  }

  const idNum = Number(userId);

  
  const existing = await prisma.favorite.findFirst({
    where: { userId: idNum, destinationId },
  });
  if (existing) {
    return NextResponse.json({ message: "Već je u omiljenima." }, { status: 409 });
  }

  const created = await prisma.favorite.create({
    data: { userId: idNum, destinationId },
  });

  return NextResponse.json(created, { status: 201, headers: { "Cache-Control": "no-store" } });
}
