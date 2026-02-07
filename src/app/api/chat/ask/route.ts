import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
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

// ===== AI (HuggingFace) =====
const HF_MODEL = process.env.HF_MODEL || "HuggingFaceH4/zephyr-7b-beta";
const HF_API_TOKEN = process.env.HF_API_TOKEN || "";

async function askHuggingFace(userQuestion: string): Promise<string | null> {
  if (!HF_API_TOKEN) return null;

  const prompt = [
    "Ti si Travel Chatbot. Odgovaraj na srpskom.",
    "Odgovaraj kratko, jasno i korisno.",
    "Ako pitanje nije vezano za putovanja, ljubazno reci da pomažeš oko putovanja.",
    "",
    `Pitanje: ${userQuestion}`,
    "Odgovor:",
  ].join("\n");

  const url = `https://router.huggingface.co/hf-inference/models/${encodeURIComponent(HF_MODEL)}`;


  // HF free tier ponekad vrati 503 (model se “budi”) -> 1 retry
  for (let attempt = 1; attempt <= 2; attempt++) {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 180,
          temperature: 0.7,
          return_full_text: false,
        },
        options: { wait_for_model: true },
      }),
      cache: "no-store",
    });

    if (resp.status === 503 && attempt === 1) {
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      console.error("HF error:", resp.status, txt);
      return null;
    }

    const data: any = await resp.json().catch(() => null);

    if (Array.isArray(data) && data[0]?.generated_text) {
      return String(data[0].generated_text).trim();
    }
    if (data?.generated_text) {
      return String(data.generated_text).trim();
    }

    return null;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
    const body = (await req.json().catch(() => null)) as AskBody | null;
    const q = (body?.question ?? "").trim();

    if (!q) {
      return NextResponse.json({ message: "Pitanje je obavezno." }, { status: 400 });
    }

    // 1) POKUŠAJ IZ BAZE (kao pre)
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

    // Ako je nađen dobar match u bazi
    if (best && bestScore > 0 && best.answer?.text) {
      const baseKw = splitKeywords(best.keywords);
      const baseCat = best.category ? normalize(best.category) : null;

      const related = questions
        .filter((q2: typeof questions[number]) => q2.id !== best!.id && q2.answer?.text)
        .map((q2: typeof questions[number]) => {
          const kw2 = splitKeywords(q2.keywords);
          const sameCat =
            baseCat && q2.category ? normalize(q2.category) === baseCat : false;
          const score = (sameCat ? 100 : 0) + overlapScore(baseKw, kw2);
          return { id: q2.id, questionText: q2.text, score };
        })
        .sort(
          (
            a: { id: number; questionText: string; score: number },
            b: { id: number; questionText: string; score: number }
          ) => b.score - a.score
        )
        .slice(0, 3)
        .map((x: { id: number; questionText: string; score: number }) => ({
          id: x.id,
          questionText: x.questionText,
        }));

      // Snimi u istoriju za ulogovane
      const { userId, role } = await getAuthFromRequest();
      if ((role === "ADMIN" || role === "REGISTROVANI_KORISNIK") && userId) {
        const idNum = Number(userId);
        if (!Number.isNaN(idNum)) {
          await prisma.chatHistory
            .create({ data: { userId: idNum, question: q, answer: best.answer.text } })
            .catch(() => {});
        }
      }

      return NextResponse.json(
        {
          found: true,
          source: "db",
          matchedQuestionId: best.id,
          answerText: best.answer.text,
          relatedQuestions: related,
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    // 2) FALLBACK NA AI
    const aiAnswer = await askHuggingFace(q);

    const finalAnswer =
      aiAnswer || "Izvinjavam se, ali trenutno nemam odgovor na Vase pitanje.";

    // Snimi u istoriju (i AI odgovore) za ulogovane
    const { userId, role } = await getAuthFromRequest();
    if ((role === "ADMIN" || role === "REGISTROVANI_KORISNIK") && userId) {
      const idNum = Number(userId);
      if (!Number.isNaN(idNum)) {
        await prisma.chatHistory
          .create({ data: { userId: idNum, question: q, answer: finalAnswer } })
          .catch(() => {});
      }
    }

    return NextResponse.json(
      {
        found: false,
        source: aiAnswer ? "ai" : "fallback",
        answerText: finalAnswer,
        relatedQuestions: [],
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("POST /api/chat/ask error:", err);
    return NextResponse.json(
      {
        found: false,
        source: "fallback",
        answerText: "Izvinjavam se, ali trenutno nemam odgovor na Vase pitanje.",
        relatedQuestions: [],
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
