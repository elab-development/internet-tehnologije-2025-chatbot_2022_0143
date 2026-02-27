import { cookies } from "next/headers";
import { NextResponse } from "next/server";
// @ts-ignore
import bcrypt from "bcrypt";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Prijava korisnika
 *     description: Proverava kredencijale i postavlja httpOnly kolačiće `userId` i `role`.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "pera@example.com"
 *               password:
 *                 type: string
 *                 example: "tajnaLozinka123"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Uspešno logovanje (postavljeni kolačići)
 *         headers:
 *           Set-Cookie:
 *             description: Postavlja `userId` i `role` kao httpOnly cookies
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "pera@example.com"
 *                     roleName:
 *                       type: string
 *                       example: "REGISTROVANI_KORISNIK"
 *                 roleName:
 *                   type: string
 *                   example: "REGISTROVANI_KORISNIK"
 *       400:
 *         description: Nedostaje email ili lozinka
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email i lozinka su obavezni."
 *       401:
 *         description: Neispravni kredencijali
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Neuspešno logovanje. Proverite kredencijale."
 *       500:
 *         description: Serverska greška
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Serverska greška pri logovanju."
 */

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => null);

    const emailRaw = (body?.email ?? "") as string;
    const passwordRaw = (body?.password ?? "") as string;

    const email = emailRaw.trim().toLowerCase();
    const password = String(passwordRaw);

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email i lozinka su obavezni." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Neuspešno logovanje. Proverite kredencijale." },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return NextResponse.json(
        { message: "Neuspešno logovanje. Proverite kredencijale." },
        { status: 401 }
      );
    }

    const roleName = user.role?.name ?? "REGISTROVANI_KORISNIK";

    const cookieStore = await cookies();
    cookieStore.set("userId", String(user.id), { httpOnly: true, path: "/" });
    cookieStore.set("role", roleName, { httpOnly: true, path: "/" });

    return NextResponse.json(
      {
        user: { id: user.id, email: user.email, roleName },
        roleName,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("Greška u /api/auth/login:", err);
    return NextResponse.json(
      { message: "Serverska greška pri logovanju.", details: err?.message },
      { status: 500 }
    );
  }
}
