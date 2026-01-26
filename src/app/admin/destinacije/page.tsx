"use client";

import { useEffect, useState } from "react";
import CustomButton from "../../components/CustomButton";

type Destination = {
  id: number;
  nameCity: string;
  country: string;
  description?: string | null;
  rating?: number | null;
};

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // forma za dodavanje
  const [nameCity, setNameCity] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState<string>("");

  useEffect(() => {
    async function loadDestinations() {
      try {
        const res = await fetch("/api/destinations");
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

    loadDestinations();
  }, []);

  async function handleDelete(id: number) {
    const potvrda = window.confirm(
      "Da li ste sigurni da želite da obrišete destinaciju?"
    );
    if (!potvrda) return;

    try {
      const res = await fetch(`/api/destinations/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

        if (!res.ok) {
        const msg =
            data?.message || // iz backend-a
            data?.error ||
            data?.details ||
            `Brisanje nije uspelo. Status: ${res.status}`;
        alert(msg);
        return;
        }

      setDestinations((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
      alert("Došlo je do greške pri komunikaciji sa serverom.");
    }
  }

  async function handleCreate() {
  if (!nameCity || !country) {
    alert("Naziv grada i država su obavezni.");
    return;
  }

  try {
    const res = await fetch("/api/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameCity,
        country,
        description: description || null,
        slug: null, // ili možeš napraviti slug iz naziva, ali za faks nije obavezno
        rating: rating ? Number(rating) : null,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        data?.message ||
        `Kreiranje nije uspelo. Status: ${res.status}`;
      alert(msg);
      return;
    }

    // POST vraća direktno destinaciju, ne { destination: ... }
    setDestinations((prev) => [...prev, data as Destination]);

    // očisti formu
    setNameCity("");
    setCountry("");
    setDescription("");
    setRating("");
  } catch (err) {
    console.error(err);
    alert("Došlo je do greške pri komunikaciji sa serverom.");
  }
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
      

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-white/90 rounded-2xl shadow-md border border-slate-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Dodavanje nove destinacije
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-600">Grad</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={nameCity}
                onChange={(e) => setNameCity(e.target.value)}
                placeholder="npr. Pariz"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-600">Država</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="npr. Francuska"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-slate-600">Opis</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kratak opis destinacije..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-600">Ocena (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <CustomButton label="Sačuvaj destinaciju" onClick={handleCreate} />
          </div>
        </section>

        <section className="bg-white/90 rounded-2xl shadow-md border border-slate-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Postojeće destinacije
          </h2>

          {loading ? (
            <p>Učitavanje...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : destinations.length === 0 ? (
            <p className="text-slate-700">
              Trenutno nema destinacija u bazi.
            </p>
          ) : (
            <div className="space-y-3">
              {destinations.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start justify-between gap-4 border border-slate-100 rounded-xl px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {d.nameCity}, {d.country}
                    </p>
                    {d.description && (
                      <p className="text-xs text-slate-600">
                        {d.description}
                      </p>
                    )}
                    {typeof d.rating === "number" && (
                      <p className="text-xs text-slate-500">
                        Ocena: {d.rating}/5
                      </p>
                    )}
                  </div>

                  <CustomButton
                    label="Obriši"
                    variant="secondary"
                    onClick={() => handleDelete(d.id)}
                  />
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
