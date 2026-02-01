"use client";

import { useEffect, useMemo, useState } from "react";
import ExternalApiDemo from "../components/ExternalApiDemo";

type Destination = {
  id: number;
  nameCity: string;
  country: string;
  description?: string | null;
  rating?: number | null;
};

type UiRole = "REGISTROVANI_KORISNIK" | "ADMIN" | "GOST" | null;

export default function DestinacijaPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [role, setRole] = useState<UiRole>(null);

  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const favoriteIdsMemo = useMemo(() => favoriteIds, [favoriteIds]);

  useEffect(() => {
    async function loadAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          setRole("GOST");
          return;
        }

        const data: any = await res.json();
        const rn = (data?.roleName ?? "").toUpperCase();

        if (rn === "ADMIN") setRole("ADMIN");
        else if (rn === "REGISTROVANI_KORISNIK") setRole("REGISTROVANI_KORISNIK");
        else setRole("GOST");
      } catch {
        setRole("GOST");
      }
    }

    async function loadDestinations() {
      try {
        const res = await fetch("/api/destinations", { cache: "no-store" });
        if (!res.ok) throw new Error("Neuspešan odgovor sa servera");
        const data: Destination[] = await res.json();
        setDestinations(data);
      } catch (err) {
        console.error(err);
        setError("Došlo je do greške pri učitavanju destinacija.");
      } finally {
        setLoading(false);
      }
    }

    void loadAuth();
    void loadDestinations();
  }, []);

  useEffect(() => {
    async function loadFavoritesForUser() {
      if (role !== "REGISTROVANI_KORISNIK") return;

      try {
        const res = await fetch("/api/favorites", { cache: "no-store" });
        const data = await res.json().catch(() => []);
        if (!res.ok) return;

        const ids = new Set<number>((data as Destination[]).map((d) => d.id));
        setFavoriteIds(ids);
      } catch {
        // ignore
      }
    }

    void loadFavoritesForUser();
  }, [role]);

  async function toggleFavorite(destinationId: number) {
    if (role === null) return;
    if (role === "ADMIN") return;

    if (role === "GOST") {
      alert("Uloguj se da dodaš destinaciju u omiljene.");
      return;
    }

    const isFav = favoriteIdsMemo.has(destinationId);

    const next = new Set(favoriteIdsMemo);
    if (isFav) next.delete(destinationId);
    else next.add(destinationId);
    setFavoriteIds(next);

    try {
      if (!isFav) {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinationId }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok && res.status !== 409) {
          const rollback = new Set(next);
          rollback.delete(destinationId);
          setFavoriteIds(rollback);
          alert(data?.message || `Greška pri dodavanju. Status: ${res.status}`);
        }
      } else {
        const res = await fetch(`/api/favorites/${destinationId}`, {
          method: "DELETE",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const rollback = new Set(next);
          rollback.add(destinationId);
          setFavoriteIds(rollback);
          alert(data?.message || `Greška pri uklanjanju. Status: ${res.status}`);
        }
      }
    } catch (err) {
      const rollback = new Set(favoriteIdsMemo);
      setFavoriteIds(rollback);
      alert("Greška pri komunikaciji sa serverom.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Destinacije</h2>

          <div className="flex items-center gap-2 text-sm">
            {/* svi vide statistiku */}
            <a href="/stats" className="underline text-slate-700 hover:text-slate-900">
              Statistika
            </a>

            {/* samo REGISTROVANI_KORISNIK vidi i omiljene, sa separatorom | */}
            {role === "REGISTROVANI_KORISNIK"&& (
              <>
                <span className="text-slate-400">|</span>
                <a href="/omiljene" className="underline text-slate-700 hover:text-slate-900">
                  Moje omiljene
                </a>
              </>
            )}
          </div>
        </div>


        {loading ? (
          <p>Učitavanje...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : destinations.length === 0 ? (
          <div className="bg-white/80 rounded-2xl shadow-md border border-slate-100 p-6">
            <p className="text-slate-700">Trenutno nema destinacija u bazi.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map((d) => {
                const isFav = favoriteIdsMemo.has(d.id);

                return (
                  <div
                    key={d.id}
                    className="relative bg-white/90 rounded-2xl shadow-md border border-slate-100 p-4"
                  >
                    <h3 className="font-semibold text-lg text-slate-900">
                      {d.nameCity}, {d.country}
                    </h3>

                    {d.description && <p className="text-sm text-slate-700 mt-1">{d.description}</p>}

                    {typeof d.rating === "number" && (
                      <p className="text-sm text-slate-600 mt-1">Ocena: {d.rating}/5</p>
                    )}

                    {/* SRCE: GOST vidi sivo, REGISTROVANI_KORISNIK toggle, ADMIN ne vidi ništa */}
                    {role !== null && role !== "ADMIN" && (
                      <button
                        onClick={() => void toggleFavorite(d.id)}
                        title={
                          role === "REGISTROVANI_KORISNIK"
                            ? isFav
                              ? "Ukloni iz omiljenih"
                              : "Dodaj u omiljene"
                            : "Uloguj se da dodaš u omiljene"
                        }
                        className={`absolute bottom-3 right-3 text-xl ${
                          role === "GOST"
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:scale-110 transition"
                        }`}
                      >
                        {role === "REGISTROVANI_KORISNIK" ? (isFav ? "❤️" : "🤍") : "🤍"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/*  EKSTERNI API BLOK IDE NA DNO, U ŠIRINI GRIDA */}
            <div className="mt-8">
              <ExternalApiDemo />
            </div>
          </>
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
