// src/app/api/auth/register/route.ts

import { NextResponse } from "next/server";
// @ts-ignore  // da utišamo TypeScript zbog tipova za bcrypt
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

// VAŽNO: forsiramo Node runtime (bcrypt ne radi na edge runtime-u)
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 1) Validacija ulaza
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

    // 2) Provera da li postoji korisnik sa tim emailom
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Korisnik sa ovim emailom već postoji." },
        { status: 409 }
      );
    }

    // 3) Nađi ulogu REGISTROVANI_KORISNIK
    const registeredRole = await prisma.role.findFirst({
      where: { name: "REGISTROVANI_KORISNIK" },
    });

    if (!registeredRole) {
      return NextResponse.json(
        {
          message:
            "Uloga REGISTROVANI_KORISNIK ne postoji u bazi. Proveri Role tabelu.",
        },
        { status: 500 }
      );
    }

    // 4) Hash lozinke
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5) Kreiraj user-a
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: registeredRole.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
      },
    });

    // 6) Uspeh
    return NextResponse.json(
      {
        message: "Registracija uspešna.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Greška pri registraciji:", error);
    // VRATI KONKRETNU PORUKU da znamo šta se desilo
    return NextResponse.json(
      {
        message:
          "Greška pri registraciji: " +
          (error?.message || "Nepoznata greška."),
      },
      { status: 500 }
    );
  }
}
