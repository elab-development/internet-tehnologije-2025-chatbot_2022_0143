"use client";

import React, { useState } from "react";
import CustomButton from "../components/CustomButton";
import Card from "../components/Card";

type Destination = {
  id: number;
  title: string;
  description: string;
};

const mockDestinations: Destination[] = [
  {
    id: 1,
    title: "Pariz",
    description: "Grad ljubavi, Ajfelov toranj i dobra hrana.",
  },
  {
    id: 2,
    title: "Rim",
    description: "Koloseum, istorija i najbolja pasta.",
  },
  {
    id: 3,
    title: "Barselona",
    description: "Sagrada Familia, prepoznatljiva arhitektura i odličan noćni život.",
  },
];

export default function DestinationsPage() {
  const [favorites, setFavorites] = useState<number[]>([]);

  const handleToggleFavorite = (destination: Destination) => {
    setFavorites((prev) =>
      prev.includes(destination.id)
        ? prev.filter((id) => id !== destination.id)
        : [...prev, destination.id]
    );

    const isNowFavorite = !favorites.includes(destination.id);

    if (isNowFavorite) {
      alert(
        `Ovo će kasnije pozivati backend da doda "${destination.title}" u omiljene destinacije.`
      );
    } else {
      alert(
        `Ovo će kasnije pozivati backend da ukloni "${destination.title}" iz omiljenih.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Travel Chatbot</h1>
          <nav className="space-x-4 text-sm">
            <a href="/" className="hover:underline">
              Chat
            </a>
            <a href="/destinations" className="font-semibold underline">
              Destinacije
            </a>
            <a href="/admin" className="hover:underline">
              Admin
            </a>
            <a href="/login" className="hover:underline">
              Login
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Popularne destinacije</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {mockDestinations.map((dest) => {
            const isFavorite = favorites.includes(dest.id);

            return (
              <Card key={dest.id} title={dest.title}>
                <p className="text-sm text-gray-700 mb-3">
                  {dest.description}
                </p>
                <CustomButton
                  label={
                    isFavorite
                      ? "Ukloni iz omiljenih"
                      : "Dodaj u omiljene"
                  }
                  variant={isFavorite ? "secondary" : "primary"}
                  onClick={() => handleToggleFavorite(dest)}
                />
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
