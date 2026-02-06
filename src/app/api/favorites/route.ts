import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

function isAllowed(role: string | null) {
  return role === "REGISTROVANI_KORISNIK" || role === "ADMIN";
}

export async function GET() {
  const prisma = getPrisma();
  const { userId, role } = await getAuthFromRequest();

  if (!userId) {
    return NextResponse.json({ message: "Niste ulogovani." }, { status: 401 });
  }

  if (!isAllowed(role)) {
    return NextResponse.json(
      { message: "Samo ulogovani korisnici mogu imati omiljene." },
      { status: 403 }
    );
  }

  const idNum = Number(userId);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ message: "Neispravan userId." }, { status: 400 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: idNum },
    include: { destination: true },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(favorites.map((f) => f.destination), {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  const prisma = getPrisma();
  const { userId, role } = await getAuthFromRequest();

  if (!userId) {
    return NextResponse.json({ message: "Niste ulogovani." }, { status: 401 });
  }

  if (!isAllowed(role)) {
    return NextResponse.json(
      { message: "Samo ulogovani korisnici mogu dodavati omiljene." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const destinationId = Number(body?.destinationId);

  if (!destinationId || Number.isNaN(destinationId)) {
    return NextResponse.json({ message: "Neispravan destinationId." }, { status: 400 });
  }

  const idNum = Number(userId);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ message: "Neispravan userId." }, { status: 400 });
  }

  const existing = await prisma.favorite.findFirst({
    where: { userId: idNum, destinationId },
  });
  if (existing) {
    return NextResponse.json({ message: "Već je u omiljenima." }, { status: 409 });
  }

  const created = await prisma.favorite.create({
    data: { userId: idNum, destinationId },
  });

  return NextResponse.json(created, {
    status: 201,
    headers: { "Cache-Control": "no-store" },
  });
}
