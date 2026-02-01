"use client";

import { useEffect, useMemo, useState } from "react";

type Destination = {
  id: number;
  nameCity: string;
  country: string;
  description?: string | null;
  rating?: number | null;
};

type AuthMeResponse = {
  role?: "USER" | "ADMIN";
};

export default function OmiljenePage() {
  const [role, setRole] = useState<"USER" | "ADMIN" | "GUEST">("GUEST");
  const [items, setItems] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ids = useMemo(() => new Set(items.map((d) => d.id)), [items]);

  useEffect(() => {
    async function loadAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data: AuthMeResponse = await res.json();
        if (data?.role === "USER" || data?.role === "ADMIN") setRole(data.role);
      } catch {}
    }

    async function loadFavorites() {
      try {
        const res = await fetch("/api/favorites", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.message || `Greška. Status: ${res.status}`);
          return;
        }
        setItems(data as Destination[]);
      } catch (e) {
        setError("Greška pri učitavanju omiljenih.");
      } finally {
        setLoading(false);
      }
    }

    void loadAuth();
    void loadFavorites();
  }, []);

  async function removeFavorite(destinationId: number) {
    try {
      const res = await fetch(`/api/favorites/${destinationId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.message || `Greška. Status: ${res.status}`);
        return;
      }
      setItems((prev) => prev.filter((d) => d.id !== destinationId));
    } catch {
      alert("Greška pri komunikaciji sa serverom.");
    }
  }

  
  if (role === "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white/90 rounded-2xl p-6 border border-slate-100">
          <p className="text-slate-700">Admin nema omiljene destinacije.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Moje omiljene</h2>
          <a href="/destinacija" className="text-sm underline text-slate-700 hover:text-slate-900">
            Nazad na destinacije
          </a>
        </div>

        {loading ? (
          <p>Učitavanje...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <div className="bg-white/80 rounded-2xl shadow-md border border-slate-100 p-6">
            <p className="text-slate-700">Još nemaš omiljene destinacije.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((d) => (
              <div
                key={d.id}
                className="relative bg-white/90 rounded-2xl shadow-md border border-slate-100 p-4"
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

                {/* u omiljenim je uvek ❤️, klik uklanja */}
                <button
                  className="absolute bottom-3 right-3 text-xl hover:scale-110 transition"
                  title="Ukloni iz omiljenih"
                  onClick={() => void removeFavorite(d.id)}
                >
                  ❤️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
