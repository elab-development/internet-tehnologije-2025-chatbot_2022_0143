// src/app/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import Card from "../components/Card";

type HistoryItem = {
  id: number;
  createdAt: string;
  question: string;
  answer: string;
  user?: { id: number; email: string };
};

export default function HistoryPage() {
  const [rows, setRows] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/chat/history?limit=100", {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setError(data?.message || `Greška. Status: ${res.status}`);
          setRows([]);
          return;
        }

        setRows(Array.isArray(data) ? data : []);
      } catch {
        setError("Greška pri učitavanju istorije.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5]">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Card title="Istorija razgovora">
          {loading ? (
            <p className="text-sm text-slate-600">Učitavanje...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-600">Nema sačuvane istorije.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="border border-slate-200 rounded-xl p-3 bg-white/70"
                >
                  <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                    <span>{new Date(r.createdAt).toLocaleString()}</span>
                    {r.user?.email && (
                      <span className="font-medium text-slate-600">
                        {r.user.email}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    Pitanje:
                  </p>
                  <p className="text-sm text-slate-800">{r.question}</p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    Odgovor:
                  </p>
                  <p className="text-sm text-slate-800">{r.answer}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
