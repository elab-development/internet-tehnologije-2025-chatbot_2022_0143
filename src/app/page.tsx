"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "./components/CustomButton";
import InputField from "./components/InputField";
import Card from "./components/Card";

type ChatMessage = {
  id: number;
  from: "user" | "bot";
  text: string;
  kind?: "followup";
  relatedQuestions?: { id: number; questionText: string }[];
};

type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

const popularQuestions = [
  "Koje destinacije preporučuješ za letovanje sa malim budžetom?",
  "Šta da ponesem na put u planine zimi?",
  "Koji grad u Evropi je najbolji za vikend putovanje?",
];

export default function HomePage() {
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: "Zdravo! Ja sam travel chatbot. Postavi mi pitanje o putovanjima. ✈️",
    },
  ]);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  const [sending, setSending] = useState(false);

  
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          setIsLoggedIn(false);
          setRoleName(null);
          return;
        }

        const data = await res.json().catch(() => null);
        const rn = data?.user?.roleName ?? data?.roleName ?? null;

        setRoleName(rn);
        setIsLoggedIn(!!rn);
      } catch {
        setIsLoggedIn(false);
        setRoleName(null);
      }
    }

    checkAuth();
  }, []);

  
  useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await fetch("/api/faq?limit=5", { cache: "no-store" });
        if (!res.ok) {
          setFaqs([]);
          return;
        }
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
      } catch {
        setFaqs([]);
      }
    }

    loadFaqs();
  }, []);

  const removeLastFollowupIfAny = () => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.kind === "followup") return prev.slice(0, -1);
      return prev;
    });
  };

  const askBackend = async (question: string) => {
    const res = await fetch("/api/chat/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      cache: "no-store",
      credentials: "include",
    });

    const data = await res.json().catch(() => null);
    return data as
      | {
          found: boolean;
          answerText: string;
          relatedQuestions: { id: number; questionText: string }[];
        }
      | null;
  };

  const sendQuestion = async (text: string) => {
    const q = text.trim();
    if (!q || sending) return;

    removeLastFollowupIfAny();
    setSending(true);

    const userMsg: ChatMessage = {
      id: Date.now(),
      from: "user",
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const data = await askBackend(q);

      const answerText =
        data?.answerText ??
        "Izvinjavam se, ali trenutno nemam odgovor na Vase pitanje.";

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        from: "bot",
        text: answerText,
      };

      setMessages((prev) => [...prev, botMsg]);

      const related = data?.relatedQuestions ?? [];

      if (data?.found && related.length > 0) {
        const followupMsg: ChatMessage = {
          id: Date.now() + 2,
          from: "bot",
          text: "Mozda Vas jos zanima...",
          kind: "followup",
          relatedQuestions: related,
        };
        setMessages((prev) => [...prev, followupMsg]);
      }
    } catch {
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        from: "bot",
        text: "Izvinjavam se, ali trenutno nemam odgovor na Vase pitanje.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleAsk = async (event: FormEvent) => {
    event.preventDefault();
    const q = currentQuestion;
    setCurrentQuestion("");
    await sendQuestion(q);
  };

  const handleQuickQuestion = async (question: string) => {
    setCurrentQuestion("");
    await sendQuestion(question);
  };

  const toggleFaq = (id: number) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    alert("Uspešno ste se odjavili.");
    setIsLoggedIn(false);
    setRoleName(null);
    router.push("/");
    router.refresh();
  };

  const handleFollowupNo = () => {
    removeLastFollowupIfAny();
  };

  const handleFollowupYes = async (
    relatedQuestions?: { id: number; questionText: string }[]
  ) => {
    const first = relatedQuestions?.[0];
    if (!first) {
      removeLastFollowupIfAny();
      return;
    }
    removeLastFollowupIfAny();
    await sendQuestion(first.questionText);
  };

  const canSeeHistory =
    roleName === "ADMIN" || roleName === "REGISTROVANI_KORISNIK";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* INFO BANNER */}
        <section>
          {isLoggedIn === null ? (
            <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              Provera statusa prijave...
            </p>
          ) : isLoggedIn ? (
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <div className="flex flex-col gap-1">
                <p>Prijavljeni ste.</p>
                {canSeeHistory && (
                  <button
                    type="button"
                    onClick={() => router.push("/history")}
                    className="text-xs underline text-slate-700 hover:text-slate-900 w-fit"
                  >
                    Pogledaj istoriju razgovora
                  </button>
                )}
              </div>

              <CustomButton
                label="Odjavi se"
                variant="secondary"
                onClick={handleLogout}
              />
            </div>
          ) : (
            <div className="text-sm bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <p>Trenutno ste gost.</p>
              {/* Gost NEMA opciju za istoriju (nema ni linka, ni dugmeta) */}
            </div>
          )}
        </section>

        {/* CHAT + FAQ */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* CHAT */}
          <Card title="Chat sa chatbotom">
            <div className="h-64 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 mb-4">
              {messages.map((msg) => (
                <div key={msg.id} className="mb-2">
                  <div
                    className={`flex ${
                      msg.from === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-xl text-sm shadow-sm max-w-[85%] ${
                        msg.from === "user"
                          ? "bg-[#FFDAB9] text-[#4A3630]"
                          : "bg-[#F3F3F3] text-[#3A3A3A]"
                      }`}
                    >
                      {msg.text}

                      {msg.kind === "followup" && (
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleFollowupYes(msg.relatedQuestions)}
                              className="text-xs rounded-full border border-slate-200 px-3 py-1 bg-white hover:bg-emerald-50"
                            >
                              Da
                            </button>
                            <button
                              type="button"
                              onClick={handleFollowupNo}
                              className="text-xs rounded-full border border-slate-200 px-3 py-1 bg-white hover:bg-amber-50"
                            >
                              Ne
                            </button>
                          </div>

                          {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {msg.relatedQuestions.map((rq) => (
                                <button
                                  key={rq.id}
                                  type="button"
                                  onClick={() => {
                                    removeLastFollowupIfAny();
                                    void sendQuestion(rq.questionText);
                                  }}
                                  className="text-[11px] rounded-full border border-slate-200 px-3 py-1 bg-white/80 hover:bg-[#FFE4B5]/60 hover:border-[#FFE4B5] shadow-sm text-slate-700"
                                >
                                  {rq.questionText}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAsk} className="flex gap-2">
              <InputField
                label="Pitanje"
                hideLabel
                placeholder="Postavi pitanje o putovanjima..."
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
              />
              <CustomButton type="submit" label={sending ? "..." : "Pošalji"} />
            </form>

            <div className="mt-4">
              <p className="text-xs font-semibold mb-1 text-slate-600">
                Popularna pitanja (klikni da pošalješ):
              </p>
              <div className="flex flex-wrap gap-2">
                {popularQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void handleQuickQuestion(q)}
                    className="text-xs rounded-full border border-slate-200 px-3 py-1 bg-white/80 hover:bg-[#FFE4B5]/60 hover:border-[#FFE4B5] hover:scale-105 transition-transform duration-150 shadow-sm text-slate-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* FAQ */}
          <Card title="Često postavljana pitanja">
            {faqs.length === 0 ? (
              <p className="text-sm text-slate-500">Učitavanje pitanja...</p>
            ) : (
              <ul className="space-y-2">
                {faqs.map((faq) => (
                  <li key={faq.id}>
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left text-sm font-medium text-slate-800 flex justify-between items-center"
                    >
                      <span>{faq.question}</span>
                      <span className="text-xs text-slate-500">
                        {expandedFaqId === faq.id ? "−" : "+"}
                      </span>
                    </button>
                    {expandedFaqId === faq.id && (
                      <p className="mt-1 text-xs text-slate-700 border-l-2 border-slate-300 pl-2">
                        {faq.answer}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="max-w-5xl mx-auto px-4 py-3 text-xs text-slate-500 flex justify-between">
          <span>© 2025 Travel Chatbot</span>
        </div>
      </footer>
    </div>
  );
}
