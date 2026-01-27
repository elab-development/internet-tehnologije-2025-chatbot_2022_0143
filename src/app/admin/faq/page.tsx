// src/app/admin/faq/page.tsx
"use client";

import { useEffect, useState } from "react";
import CustomButton from "../../components/CustomButton";

type FaqItem = {
  id: number;
  questionText: string;
  answerText: string;
  keywords: string | null;
  category: string | null;
};

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // forma
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // učitaj postojeća pitanja i odgovore
  useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await fetch("/api/faq", { cache: "no-store" });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setError(
            data?.message ||
              `Greška pri učitavanju. Status: ${res.status}`
          );
          return;
        }

        setFaqs(data as FaqItem[]);
      } catch (err) {
        console.error(err);
        setError("Došlo je do greške pri učitavanju podataka.");
      } finally {
        setLoading(false);
      }
    }

    void loadFaqs();
  }, []);

  function resetForm() {
    setQuestionText("");
    setAnswerText("");
    setKeywords("");
    setCategory("");
    setEditingId(null);
  }

  function startEdit(faq: FaqItem) {
    setEditingId(faq.id);
    setQuestionText(faq.questionText);
    setAnswerText(faq.answerText);
    setKeywords(faq.keywords ?? "");
    setCategory(faq.category ?? "");
  }

  async function handleDelete(id: number) {
    const potvrda = window.confirm(
      "Da li ste sigurni da želite da obrišete ovo pitanje i odgovor?"
    );
    if (!potvrda) return;

    try {
      const res = await fetch(`/api/faq/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          `Brisanje nije uspelo. Status: ${res.status}`;
        alert(msg);
        return;
      }

      setFaqs((prev) => prev.filter((f) => f.id !== id));

      // ako smo baš ovo pitanje editovali, očisti formu
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      alert("Došlo je do greške pri komunikaciji sa serverom.");
    }
  }

  async function handleSave() {
    if (!questionText.trim() || !answerText.trim()) {
      alert("Pitanje i odgovor su obavezni.");
      return;
    }

    const payload = {
      questionText: questionText.trim(),
      answerText: answerText.trim(),
      keywords: keywords.trim() || null,
      category: category.trim() || null,
    };

    try {
      setSaving(true);

      if (editingId === null) {
        // KREIRANJE
        const res = await fetch("/api/faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const msg =
            data?.message ||
            data?.error ||
            `Kreiranje nije uspelo. Status: ${res.status}`;
          alert(msg);
          return;
        }

        setFaqs((prev) => [...prev, data as FaqItem]);
        resetForm();
      } else {
        // IZMENA
        const res = await fetch(`/api/faq/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const msg =
            data?.message ||
            data?.error ||
            `Izmena nije uspela. Status: ${res.status}`;
          alert(msg);
          return;
        }

        setFaqs((prev) =>
          prev.map((f) => (f.id === editingId ? (data as FaqItem) : f))
        );
        resetForm();
      }
    } catch (err) {
      console.error(err);
      alert("Došlo je do greške pri komunikaciji sa serverom.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Gornja sekcija – forma za dodavanje / izmenu */}
        <section className="bg-white/90 rounded-2xl shadow-md border border-slate-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Pitanja i odgovori
          </h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-600">Pitanje</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={2}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="npr. Da li chatbot može da mi predloži destinaciju za leto?"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-600">Odgovor</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={3}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Kratak, jasan odgovor koji će chatbot koristiti..."
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-600">
                  Ključne reči (opciono)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="npr. leto, more, preporuka"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600">
                  Kategorija (opciono)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="npr. Destinacije, Rezervacije..."
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <CustomButton
                label={
                  saving
                    ? "Čuvanje..."
                    : editingId === null
                    ? "Sačuvaj pitanje"
                    : "Sačuvaj izmene"
                }
                onClick={handleSave}
                disabled={saving}
              />
              {editingId !== null && (
                <CustomButton
                  label="Otkaži"
                  variant="secondary"
                  onClick={resetForm}
                  disabled={saving}
                />
              )}
            </div>
          </div>
        </section>

        {/* Donja sekcija – lista postojećih Q&A */}
        <section className="bg-white/90 rounded-2xl shadow-md border border-slate-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Postojeća pitanja i odgovori
          </h2>

          {loading ? (
            <p>Učitavanje...</p>
          ) : error ? (
            <p className="text-red-600 text-sm">{error}</p>
          ) : faqs.length === 0 ? (
            <p className="text-slate-700 text-sm">
              Trenutno nema unetih pitanja i odgovora.
            </p>
          ) : (
            <div className="space-y-3">
              {faqs.map((f) => (
                <div
                  key={f.id}
                  className="border border-slate-100 rounded-xl px-3 py-2 space-y-1"
                >
                  <p className="font-medium text-slate-900">
                    {f.questionText}
                  </p>
                  <p className="text-xs text-slate-700">{f.answerText}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                    <div className="text-[11px] text-slate-500 space-x-2">
                      {f.keywords && (
                        <span>Ključne reči: {f.keywords}</span>
                      )}
                      {f.category && (
                        <span>| Kategorija: {f.category}</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <CustomButton
                        label="Izmeni"
                        variant="secondary"
                        onClick={() => startEdit(f)}
                      />
                      <CustomButton
                        label="Obriši"
                        variant="secondary"
                        onClick={() => handleDelete(f.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
