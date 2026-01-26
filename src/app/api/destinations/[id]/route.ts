import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log("DELETE /api/destinations/[id] id:", id);

    const { role } = await getAuthFromRequest();

    if (role !== "ADMIN") {
      return NextResponse.json(
        { message: "Samo admin može da briše destinacije." },
        { status: 403 }
      );
    }

    const idNum = Number(id);

    if (Number.isNaN(idNum)) {
      return NextResponse.json(
        { message: "Neispravan ID destinacije.", rawId: id },
        { status: 400 }
      );
    }

    const deleted = await prisma.destination.delete({
      where: { id: idNum },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (err: any) {
    console.error("GREŠKA PRI BRISANJU DESTINACIJE:", err);

    return NextResponse.json(
      {
        message: "Internal server error pri brisanju destinacije.",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
