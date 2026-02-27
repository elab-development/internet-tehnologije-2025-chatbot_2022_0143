

import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

type FaqPayload = {
  questionText: string;
  answerText: string;
  keywords?: string | null;
  category?: string | null;
};

/**
 * @swagger
 * /api/faq:
 *   get:
 *     summary: Dohvata FAQ pitanja i odgovore
 *     description: |
 *       Ako se pošalje query parametar `limit`, endpoint vraća *public* format (question/answer) i ograničava broj rezultata.
 *       Ako se `limit` ne pošalje, radi u "admin list mode" i vraća prošireni format (questionText/answerText/keywords/category).
 *     tags:
 *       - FAQ
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Broj stavki (ako nije prosleđeno, vraća admin format bez limita)
 *     responses:
 *       200:
 *         description: Lista FAQ stavki (public ili admin format)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   description: Public format (kada postoji limit)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       question:
 *                         type: string
 *                         example: "Koji grad u Evropi je najbolji za vikend?"
 *                       answer:
 *                         type: string
 *                         example: "Prag, Budimpešta i Beč su odlični izbori za vikend."
 *                 - type: array
 *                   description: Admin format (kada nema limit parametra)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       questionText:
 *                         type: string
 *                         example: "Koji grad u Evropi je najbolji za vikend?"
 *                       answerText:
 *                         type: string
 *                         example: "Prag, Budimpešta i Beč su odlični izbori za vikend."
 *                       keywords:
 *                         type: string
 *                         nullable: true
 *                         example: "vikend, evropa, putovanje"
 *                       category:
 *                         type: string
 *                         nullable: true
 *                         example: "Evropa"
 *       500:
 *         description: Greška na serveru
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Greška pri učitavanju pitanja i odgovora."
 *
 *   post:
 *     summary: Kreira novo FAQ pitanje i odgovor (ADMIN)
 *     description: Samo ADMIN može da kreira FAQ. Kreiranje se radi u transakciji (Question + Answer).
 *     tags:
 *       - FAQ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *                 example: "Šta poneti na put u planine zimi?"
 *               answerText:
 *                 type: string
 *                 example: "Topla odeća u slojevima, kapa, rukavice, termos i dereze po potrebi."
 *               keywords:
 *                 type: string
 *                 nullable: true
 *                 example: "planine, zima, oprema"
 *               category:
 *                 type: string
 *                 nullable: true
 *                 example: "Oprema"
 *             required:
 *               - questionText
 *               - answerText
 *     responses:
 *       201:
 *         description: Kreirano FAQ pitanje i odgovor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 11
 *                 questionText:
 *                   type: string
 *                   example: "Šta poneti na put u planine zimi?"
 *                 answerText:
 *                   type: string
 *                   example: "Topla odeća u slojevima, kapa, rukavice, termos i dereze po potrebi."
 *                 keywords:
 *                   type: string
 *                   nullable: true
 *                   example: "planine, zima, oprema"
 *                 category:
 *                   type: string
 *                   nullable: true
 *                   example: "Oprema"
 *       400:
 *         description: Pitanje i odgovor su obavezni
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pitanje i odgovor su obavezni."
 *       403:
 *         description: Nema dozvolu (nije ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Samo admin može da upravlja pitanjima i odgovorima."
 *       500:
 *         description: Greška na serveru
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Greška pri kreiranju pitanja i odgovora."
 */

export async function GET(req: NextRequest) {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");

    
    const isAdminListMode = !limitParam;

    const limit = limitParam
      ? Math.min(Math.max(Number(limitParam) || 5, 1), 50) 
      : undefined;

    const questions = await prisma.question.findMany({
      where: { answer: { isNot: null } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { answer: true },
    });

    if (isAdminListMode) {
     const adminFaqs = questions.map((q: any) => ({
        id: q.id,
        questionText: q.text,
        answerText: q.answer?.text ?? "",
        keywords: q.keywords ?? null,
        category: q.category ?? null,
      }));
      return NextResponse.json(adminFaqs, { status: 200 });
    }

    
    const publicFaqs = questions.map((q) => ({
      id: q.id,
      question: q.text,
      answer: q.answer?.text ?? "",
    }));

    return NextResponse.json(publicFaqs, { status: 200 });
  } catch (error) {
    console.error("Greška pri učitavanju FAQ:", error);
    return NextResponse.json(
      { message: "Greška pri učitavanju pitanja i odgovora." },
      { status: 500 }
    );
  }
}




export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
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

    const created = await prisma.$transaction(async (tx: any) => {
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
