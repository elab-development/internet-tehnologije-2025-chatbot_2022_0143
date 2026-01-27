// src/app/api/faq/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

type FaqPayload = {
  questionText: string;
  answerText: string;
  keywords?: string | null;
  category?: string | null;
};

// IZMENI POSTOJEĆE PITANJE + ODGOVOR
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { role } = await getAuthFromRequest();

    if (role !== "ADMIN") {
      return NextResponse.json(
        { message: "Samo admin može da upravlja pitanjima i odgovorima." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const idNum = Number(id);

    if (Number.isNaN(idNum)) {
      return NextResponse.json(
        { message: "Neispravan ID pitanja.", rawId: id },
        { status: 400 }
      );
    }

    const body: FaqPayload = await req.json();
    const { questionText, answerText, keywords, category } = body;

    if (!questionText?.trim() || !answerText?.trim()) {
      return NextResponse.json(
        { message: "Pitanje i odgovor su obavezni." },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const question = await tx.question.update({
        where: { id: idNum },
        data: {
          text: questionText.trim(),
          keywords: keywords?.trim() || null,
          category: category?.trim() || null,
        },
      });

      const answer = await tx.answer.upsert({
        where: { questionId: idNum },
        update: { text: answerText.trim() },
        create: { text: answerText.trim(), questionId: idNum },
      });

      return { question, answer };
    });

    const responseFaq = {
      id: updated.question.id,
      questionText: updated.question.text,
      answerText: updated.answer.text,
      keywords: updated.question.keywords,
      category: updated.question.category,
    };

    return NextResponse.json(responseFaq, { status: 200 });
  } catch (err: any) {
    console.error("Greška pri izmeni FAQ:", err);
    return NextResponse.json(
      {
        message: "Greška pri izmeni pitanja i odgovora.",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}

// OBRIŠI PITANJE + ODGOVOR
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { role } = await getAuthFromRequest();

    if (role !== "ADMIN") {
      return NextResponse.json(
        { message: "Samo admin može da upravlja pitanjima i odgovorima." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const idNum = Number(id);

    if (Number.isNaN(idNum)) {
      return NextResponse.json(
        { message: "Neispravan ID pitanja.", rawId: id },
        { status: 400 }
      );
    }

    // prvo obriši odgovor, zatim pitanje
    await prisma.answer.deleteMany({
      where: { questionId: idNum },
    });

    const deletedQuestion = await prisma.question.delete({
      where: { id: idNum },
    });

    return NextResponse.json(deletedQuestion, { status: 200 });
  } catch (err: any) {
    console.error("Greška pri brisanju FAQ:", err);
    return NextResponse.json(
      {
        message: "Greška pri brisanju pitanja i odgovora.",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
