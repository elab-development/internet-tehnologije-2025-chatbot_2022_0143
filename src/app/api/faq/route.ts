// src/app/api/faq/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

type FaqPayload = {
  questionText: string;
  answerText: string;
  keywords?: string | null;
  category?: string | null;
};

// VRATI SVA PITANJA I ODGOVORE
export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: "asc" },
      include: { answer: true },
    });

    const faqs = questions.map((q) => ({
      id: q.id,
      questionText: q.text,
      answerText: q.answer?.text ?? "",
      keywords: q.keywords ?? null,
      category: q.category ?? null,
    }));

    return NextResponse.json(faqs, { status: 200 });
  } catch (error) {
    console.error("Greška pri učitavanju FAQ:", error);
    return NextResponse.json(
      { message: "Greška pri učitavanju pitanja i odgovora." },
      { status: 500 }
    );
  }
}

// KREIRAJ NOVO PITANJE + ODGOVOR
export async function POST(req: NextRequest) {
  try {
    const { role } = await getAuthFromRequest();

    if (role !== "ADMIN") {
      return NextResponse.json(
        { message: "Samo admin može da upravlja pitanjima i odgovorima." },
        { status: 403 }
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

    const created = await prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          text: questionText.trim(),
          keywords: keywords?.trim() || null,
          category: category?.trim() || null,
        },
      });

      const answer = await tx.answer.create({
        data: {
          text: answerText.trim(),
          questionId: question.id,
        },
      });

      return { question, answer };
    });

    const responseFaq = {
      id: created.question.id,
      questionText: created.question.text,
      answerText: created.answer.text,
      keywords: created.question.keywords,
      category: created.question.category,
    };

    return NextResponse.json(responseFaq, { status: 201 });
  } catch (error: any) {
    console.error("Greška pri kreiranju FAQ:", error);
    return NextResponse.json(
      {
        message: "Greška pri kreiranju pitanja i odgovora.",
        details: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}
