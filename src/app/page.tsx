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
};

type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

const mockFaqs: FaqItem[] = [
  {
    id: 1,
    question: "Da li chatbot može da mi predloži destinaciju za leto?",
    answer:
      "Da – postavi pitanje tipa: 'Predloži mi letovanje za studente sa malim budžetom' i dobićeš više predloga.",
  },
  {
    id: 2,
    question: "Da li mogu da sačuvam omiljene destinacije?",
    answer:
      "U sledećoj fazi projekta dodaćemo mogućnost čuvanja favorita za ulogovane korisnike.",
  },
  {
    id: 3,
    question: "Kome je namenjen ovaj sajt?",
    answer:
      "Sajt je namenjen studentima koji žele brze savete za putovanja preko chatbota.",
  },
];

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

  // null = još proveravamo, true/false = znamo stanje
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  // proveravamo da li je korisnik ulogovan preko /api/auth/me
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          setIsLoggedIn(false);
          return;
        }

        const data = await res.json().catch(() => null);
        const roleName = data?.user?.roleName ?? data?.roleName;

        setIsLoggedIn(!!roleName);
      } catch {
        setIsLoggedIn(false);
      }
    }

    checkAuth();
  }, []);

  // simulacija učitavanja FAQ-a
  useEffect(() => {
    const timer = setTimeout(() => {
      setFaqs(mockFaqs);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const sendQuestion = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      from: "user",
      text,
    };

    const botMsg: ChatMessage = {
      id: Date.now() + 1,
      from: "bot",
      text:
        "Ovo će kasnije zvati pravi backend /api/chat/ask. Za sada samo ponavljam pitanje: " +
        text,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleAsk = (event: FormEvent) => {
    event.preventDefault();
    sendQuestion(currentQuestion);
    setCurrentQuestion("");
  };

  const handleQuickQuestion = (question: string) => {
    setCurrentQuestion("");
    sendQuestion(question);
  };

  const toggleFaq = (id: number) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  // logout dugme u info boksu
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // i ako pukne, ponašaj se kao da je odjavio
    }

    alert("Uspešno ste se odjavili.");

    setIsLoggedIn(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* INFO BANNER */}
        <section>
          {isLoggedIn === null ? (
            // dok proveravamo stanje
            <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              Provera statusa prijave...
            </p>
          ) : isLoggedIn ? (
            // PRIJAVLJEN – zeleni + dugme ODJAVI SE
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <p>Prijavljeni ste. </p>
              <CustomButton
                label="Odjavi se"
                variant="secondary"
                onClick={handleLogout}
              />
            </div>
          ) : (
            // GOST – samo tekst, bez dugmeta
            <div className="text-sm bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <p>
                Trenutno ste gost. 
              </p>
            </div>
          )}
        </section>

        {/* CHAT + FAQ */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* CHAT */}
          <Card title="Chat sa chatbotom">
            <div className="h-64 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 mb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 flex ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl text-sm shadow-sm ${
                      msg.from === "user"
                        ? "bg-[#FFDAB9] text-[#4A3630]"
                        : "bg-[#F3F3F3] text-[#3A3A3A]"
                    }`}
                  >
                    {msg.text}
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
              <CustomButton type="submit" label="Pošalji" />
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
                    onClick={() => handleQuickQuestion(q)}
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

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white/80">
        <div className="max-w-5xl mx-auto px-4 py-3 text-xs text-slate-500 flex justify-between">
          <span>© 2025 Travel Chatbot</span>
        </div>
      </footer>
    </div>
  );
}
