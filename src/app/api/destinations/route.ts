
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const destinations = await prisma.destination.findMany();
    return NextResponse.json(destinations, { status: 200 });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json(
      { message: "Greška pri čitanju destinacija" },
      { status: 500 }
    );
  }
}


type DestinationCreatePayload = {
  nameCity: string;
  country: string;
  description?: string | null;
  slug?: string | null;
  rating?: number | null;
};


export async function POST(req: NextRequest) {
  try {
    const body: DestinationCreatePayload = await req.json();
    const { nameCity, country, description, slug, rating } = body;

    if (!nameCity || !country) {
      return NextResponse.json(
        { message: "Polja nameCity i country su obavezna" },
        { status: 400 }
      );
    }

    const destination = await prisma.destination.create({
      data: {
        nameCity,
        country,
        description: description ?? null,
        slug: slug ?? null,
        rating: rating ?? null,
      } as any, 
    });

    return NextResponse.json(destination, { status: 201 });
  } catch (error) {
    console.error("Error creating destination:", error);
    return NextResponse.json(
      { message: "Greška pri kreiranju destinacije" },
      { status: 500 }
    );
  }
}
