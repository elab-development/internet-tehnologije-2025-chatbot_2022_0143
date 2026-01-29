// src/app/api/chat/ask/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

type AskBody = {
  question: string;
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9čćžđš\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOPWORDS = new Set([
  "i","a","da","li","je","su","sam","smo","ste","se","u","na","za","od","do","sa","bez",
  "koji","koja","koje","kako","šta","sta","kada","gde","gdje","koliko",
  "mi","me","mene","te","tvoje","moje","vaše","vase","vas","vi","vama",
  "ovo","to","ta","taj","ona","on","oni","one","o","iz","kod","preko","oko","ili",
]);

function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function splitKeywords(keywords?: string | null): string[] {
  if (!keywords) return [];
  return keywords
    .split(/[,;]+|\s+/)
    .map((k) => normalize(k))
    .flatMap((k) => k.split(" "))
    .map((k) => k.trim())
    .filter((k) => k.length >= 2 && !STOPWORDS.has(k));
}

function overlapScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  let hit = 0;
  for (const t of a) if (setB.has(t)) hit++;
  return hit;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as AskBody | null;
    const q = (body?.question ?? "").trim();

    if (!q) {
      return NextResponse.json({ message: "Pitanje je obavezno." }, { status: 400 });
    }

    const userTokens = tokens(q);

    const questions = await prisma.question.findMany({
      where: { answer: { isNot: null } },
      include: { answer: true },
      orderBy: { createdAt: "desc" },
    });

    let best: (typeof questions)[number] | null = null;
    let bestScore = 0;

    for (const item of questions) {
      const textTokens = tokens(item.text);
      const kwTokens = splitKeywords(item.keywords);
      const catTokens = item.category ? tokens(item.category) : [];

      const score =
        overlapScore(userTokens, textTokens) * 2 +
        overlapScore(userTokens, kwTokens) * 3 +
        overlapScore(userTokens, catTokens) * 1;

      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }

    if (!best || bestScore === 0 || !best.answer?.text) {
      return NextResponse.json(
        {
          found: false,
          answerText: "Izvinjavam se, ali trenutno nemam odgovor na Vase pitanje.",
          relatedQuestions: [],
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    const baseKw = splitKeywords(best.keywords);
    const baseCat = best.category ? normalize(best.category) : null;

    const related = questions
      .filter((q2) => q2.id !== best!.id && q2.answer?.text)
      .map((q2) => {
        const kw2 = splitKeywords(q2.keywords);
        const sameCat =
          baseCat && q2.category ? normalize(q2.category) === baseCat : false;
        const score = (sameCat ? 100 : 0) + overlapScore(baseKw, kw2);
        return { id: q2.id, questionText: q2.text, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ id, questionText }) => ({ id, questionText }));

    // SNIMANJE ISTORIJE: ADMIN i REGISTROVANI_KORISNIK
    const { userId, role } = await getAuthFromRequest();
    if ((role === "ADMIN" || role === "REGISTROVANI_KORISNIK") && userId) {
      const idNum = Number(userId);
      if (!Number.isNaN(idNum)) {
        await prisma.chatHistory.create({
          data: { userId: idNum, question: q, answer: best.answer.text },
        }).catch(() => {});
      }
    }

    return NextResponse.json(
      {
        found: true,
        matchedQuestionId: best.id,
        answerText: best.answer.text,
        relatedQuestions: related,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("POST /api/chat/ask error:", err);
    return NextResponse.json(
      {
        found: false,
        answerText: "Izvinjavam se, ali trenutno nemam odgovor na Vase pitanje.",
        relatedQuestions: [],
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
