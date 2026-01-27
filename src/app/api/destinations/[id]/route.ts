import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

type DestinationPayload = {
  nameCity: string;
  country: string;
  description?: string | null;
  slug?: string | null;
  rating?: number | null;
};

// 🔁 UPDATE destinacije
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log("PUT /api/destinations/[id] id:", id);

    const { role } = await getAuthFromRequest();

    if (role !== "ADMIN") {
      return NextResponse.json(
        { message: "Samo admin može da izmeni destinacije." },
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

    const body: DestinationPayload = await req.json();
    const { nameCity, country, description, slug, rating } = body;

    if (!nameCity || !country) {
      return NextResponse.json(
        { message: "Polja nameCity i country su obavezna." },
        { status: 400 }
      );
    }

    const updated = await prisma.destination.update({
      where: { id: idNum },
      data: {
        nameCity,
        country,
        description: description ?? null,
        slug: slug ?? null,
        rating: rating ?? null,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("GREŠKA PRI IZMENI DESTINACIJE:", err);
    return NextResponse.json(
      {
        message: "Internal server error pri izmeni destinacije.",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE destinacije 
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
