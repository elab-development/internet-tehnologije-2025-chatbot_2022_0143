"use client";

import { useEffect, useMemo, useState } from "react";
import { Chart } from "react-google-charts";

type Destination = {
  id: number;
  nameCity: string;
  country: string;
  rating?: number | null;
};

export default function StatsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/destinations", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Greška pri učitavanju");
        return res.json();
      })
      .then((data) => setDestinations(data))
      .catch(() => setError("Ne mogu da učitam statistiku."));
  }, []);

    const data = useMemo(() => {
    // counts[1] = koliko destinacija ima ocenu 1, itd.
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const d of destinations) {
      if (typeof d.rating === "number") {
        const r = Math.round(d.rating);
        if (r >= 1 && r <= 5) counts[r] = (counts[r] || 0) + 1;
      }
    }

    return [
      ["Ocena", "Broj destinacija"],
      [1, counts[1]],
      [2, counts[2]],
      [3, counts[3]],
      [4, counts[4]],
      [5, counts[5]],
    ];
  }, [destinations]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Statistika destinacija
        </h1>
        <p className="text-slate-700 mt-1">
          Grafički prikaz ocena destinacija (Google Charts).
        </p>

        {error ? (
          <p className="text-red-600 mt-4">{error}</p>
        ) : data.length <= 1 ? (
          <p className="mt-4 text-slate-700">
            Nema dovoljno podataka za prikaz grafikona.
          </p>
        ) : (
          <div className="mt-6 bg-white/90 rounded-2xl shadow-md border border-slate-100 p-4">
            <Chart
                chartType="ColumnChart"
                width="100%"
                height="420px"
                data={data}
                options={{
                    legend: { position: "none" },
                    vAxis: { title: "Broj destinacija", minValue: 0 },
                    hAxis: { title: "Ocena" },
                    colors: ["#f59e0b"]
                }}
            />


          </div>
        )}
      </div>
    </div>
  );
}
