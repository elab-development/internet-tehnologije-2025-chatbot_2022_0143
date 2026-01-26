import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const email = body?.email as string | undefined;
    const password = body?.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email i lozinka su obavezni." },
        { status: 400 }
      );
    }

    // NAĐI USERA PO EMAILU
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // ako nema usera ili lozinka ne odgovara → 401
    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: "Neuspešno logovanje. Proverite kredencijale." },
        { status: 401 }
      );
    }

    const roleName = user.role?.name ?? "USER";

    // upišemo cookie-e
    const cookieStore = await cookies();
    cookieStore.set("userId", String(user.id), {
      httpOnly: true,
      path: "/",
    });
    cookieStore.set("role", roleName, {
      httpOnly: true,
      path: "/",
    });

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
  } catch (error) {
    console.error("Greška u /api/auth/login:", error);
    return NextResponse.json(
      { message: "Serverska greška pri logovanju." },
      { status: 500 }
    );
  }
}
