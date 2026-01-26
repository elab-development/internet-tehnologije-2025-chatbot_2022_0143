"use client";

import { useEffect, useState } from "react";

type Destination = {
  id: number;
  nameCity: string;
  country: string;
  description?: string | null;
  rating?: number | null;
};

export default function DestinacijaPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const res = await fetch("/api/destinations");

        if (!res.ok) {
          throw new Error("Neuspešan odgovor sa servera");
        }

        const data: Destination[] = await res.json();
        setDestinations(data);
      } catch (err) {
        console.error(err);
        setError("Došlo je do greške pri učitavanju destinacija.");
      } finally {
        setLoading(false);
      }
    }

    loadDestinations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
      

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Destinacije</h2>

        {loading ? (
          <p>Učitavanje...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : destinations.length === 0 ? (
          <div className="bg-white/80 rounded-2xl shadow-md border border-slate-100 p-6">
            <p className="text-slate-700">
              Trenutno nema destinacija u bazi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((d) => (
              <div
                key={d.id}
                className="bg-white/90 rounded-2xl shadow-md border border-slate-100 p-4"
              >
                <h3 className="font-semibold text-lg text-slate-900">
                  {d.nameCity}, {d.country}
                </h3>
                {d.description && (
                  <p className="text-sm text-slate-700 mt-1">{d.description}</p>
                )}
                {typeof d.rating === "number" && (
                  <p className="text-sm text-slate-600 mt-1">
                    Ocena: {d.rating}/5
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="max-w-5xl mx-auto px-4 py-3 text-xs text-slate-500 flex justify-between">
          <span>© 2025 Travel Chatbot</span>
        </div>
      </footer>
    </div>
  );
}
