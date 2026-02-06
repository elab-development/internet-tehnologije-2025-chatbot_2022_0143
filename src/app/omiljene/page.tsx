"use client";

import { useEffect, useMemo, useState } from "react";

type Destination = {
  id: number;
  nameCity: string;
  country: string;
  description?: string | null;
  rating?: number | null;
};

type UserRole = "GOST" | "REGISTROVANI_KORISNIK" | "ADMIN";

type AuthMeResponse = {
  user?: {
    roleName?: UserRole | null;
  } | null;
  roleName?: UserRole | null;
};

export default function OmiljenePage() {
  const [role, setRole] = useState<UserRole>("GOST");
  const [items, setItems] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // (nije obavezno, ali ostavljam jer ti je već bilo tu)
  const ids = useMemo(() => new Set(items.map((d) => d.id)), [items]);

  useEffect(() => {
    async function loadAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data: AuthMeResponse = await res.json().catch(() => ({} as any));
        const roleName = data?.user?.roleName ?? data?.roleName;

        if (
          roleName === "ADMIN" ||
          roleName === "REGISTROVANI_KORISNIK" ||
          roleName === "GOST"
        ) {
          setRole(roleName);
        } else {
          setRole("GOST");
        }
      } catch {
        setRole("GOST");
      }
    }

    async function loadFavorites() {
      try {
        const res = await fetch("/api/favorites", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError((data as any)?.message || `Greška. Status: ${res.status}`);
          return;
        }

        setItems(data as Destination[]);
      } catch {
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
      const res = await fetch(`/api/favorites/${destinationId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert((data as any)?.message || `Greška. Status: ${res.status}`);
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
          <a
            href="/destinacija"
            className="text-sm underline text-slate-700 hover:text-slate-900"
          >
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
