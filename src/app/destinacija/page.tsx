"use client";

import Card from "../components/Card";
import CustomButton from "../components/CustomButton";

type Destination = {
  id: number;
  title: string;
  description: string;
};

const mockDestinations: Destination[] = [
  {
    id: 1,
    title: "Pariz",
    description: "Grad ljubavi, Ajfelov toranj i fantastična francuska kuhinja.",
  },
  {
    id: 2,
    title: "Rim",
    description: "Koloseum, istorija na svakom koraku i najbolja pasta.",
  },
  {
    id: 3,
    title: "Barselona",
    description:
      "Mediteranski grad sa plažama, Gaudijevom arhitekturom i živim noćnim životom.",
  },
];

export default function DestinacijaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 py-4">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Travel Chatbot
          </h1>
          <nav className="space-x-2 text-sm">
            <a
              href="/"
              className="inline-flex items-center px-3 py-1 rounded-full hover:bg-white/70 text-slate-700"
            >
              Chat
            </a>
            <a
              href="/destinacija"
              className="inline-flex items-center px-3 py-1 rounded-full bg-white shadow-sm text-slate-900 font-semibold"
            >
              Destinacije
            </a>
            <a
              href="/admin"
              className="inline-flex items-center px-3 py-1 rounded-full hover:bg-white/70 text-slate-700"
            >
              Admin
            </a>
            <a
              href="/login"
              className="inline-flex items-center px-3 py-1 rounded-full hover:bg-white/70 text-slate-700"
            >
              Login
            </a>
          </nav>
        </div>
      </header>

      {/* SADRŽAJ */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">
        <Card title="Popularne destinacije">
          <div className="grid gap-4 md:grid-cols-2">
            {mockDestinations.map((dest) => (
              <Card key={dest.id} title={dest.title}>
                <p className="mb-3">{dest.description}</p>
                <CustomButton
                  label="Dodaj u omiljene"
                  onClick={() =>
                    alert(`Ovde će kasnije ići dodavanje u omiljene: ${dest.title}`)
                  }
                />
              </Card>
            ))}
          </div>
        </Card>
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
