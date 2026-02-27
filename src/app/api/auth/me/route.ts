import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Vraća informacije o trenutno prijavljenom korisniku
 *     description: Čita httpOnly kolačiće (userId, role) i vraća podatke o korisniku ako je prijavljen.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Uspešan odgovor (ulogovan ili gost)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   nullable: true
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
 *                       example: "ADMIN"
 *                 roleName:
 *                   type: string
 *                   nullable: true
 *                   example: "ADMIN"
 *       500:
 *         description: Serverska greška
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Greška na serveru."
 */

export async function GET() {
  try {
    const prisma = getPrisma();
    const { userId } = await getAuthFromRequest();

    if (!userId) {
      return NextResponse.json({ user: null, roleName: null }, { status: 200 });
    }

    const idNum = Number(userId);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ user: null, roleName: null }, { status: 200 });
    }

    
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
