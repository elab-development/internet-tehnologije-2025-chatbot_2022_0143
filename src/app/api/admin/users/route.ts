import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// @ts-ignore
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ========================= GET /api/admin/users =========================
// Vraća sve korisnike, dozvoljeno samo ADMIN-u
export async function GET() {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get("role")?.value;

    if (role !== "ADMIN") {
      return NextResponse.json(
        { message: "Nemate dozvolu da pristupite ovoj ruti." },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { id: "asc" },
    });

    const data = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      roleName: u.role?.name ?? null,
    }));

    return NextResponse.json({ users: data }, { status: 200 });
  } catch (error) {
    console.error("Greška u /api/admin/users (GET):", error);
    return NextResponse.json(
      { message: "Greška pri učitavanju korisnika." },
      { status: 500 }
    );
  }
}

// ========================= POST /api/admin/users =========================
// Kreira NOVOG ADMINA – može da pozove samo postojeći admin
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get("role")?.value;

    if (role !== "ADMIN") {
      return NextResponse.json(
        { message: "Nemate dozvolu da kreirate administratore." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);

    const name = (body?.name as string | undefined) ?? null;
    const email = body?.email as string | undefined;
    const password = body?.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email i lozinka su obavezni." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
    return NextResponse.json(
        { message: "Email nije validnog formata." },
        { status: 400 }
    );
    }

    // 1) proveri da li već postoji korisnik sa tim emailom
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Korisnik sa tim emailom već postoji." },
        { status: 409 }
      );
    }

    // 2) nađi ADMIN rolu
    const adminRole = await prisma.role.findUnique({
      where: { name: "ADMIN" },
    });

    if (!adminRole) {
      return NextResponse.json(
        { message: "ADMIN uloga ne postoji u bazi." },
        { status: 500 }
      );
    }

    // 3) hash lozinke
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4) kreiraj user-a sa admin ulogom
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: adminRole.id,
      },
      include: { role: true },
    });

    return NextResponse.json(
      {
        user: {
          id: newAdmin.id,
          email: newAdmin.email,
          name: newAdmin.name,
          roleName: newAdmin.role?.name ?? null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Greška u /api/admin/users (POST):", error);
    return NextResponse.json(
      { message: "Greška pri kreiranju novog admina." },
      { status: 500 }
    );
  }
}
