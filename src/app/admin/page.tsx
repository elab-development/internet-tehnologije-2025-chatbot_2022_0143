"use client";

import React from "react";
import CustomButton from "../components/CustomButton";
import Card from "../components/Card";

export default function AdminPage() {
  const handleManageFaq = () => {
    alert("Ovo će kasnije voditi na upravljanje FAQ.");
  };

  const handleManageDestinations = () => {
    alert("Ovo će kasnije voditi na upravljanje destinacijama u bazi.");
  };

  const handleViewUsers = () => {
    alert("Ovo će kasnije prikazivati listu korisnika (admin only).");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* HEADER – ISTI MENI KAO NA HOME I LOGIN */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin panel</h1>
          <nav className="space-x-4 text-sm">
            <a href="/" className="hover:underline">
              Chat
            </a>
            <a href="/destinacija" className="hover:underline">
              Destinacije
            </a>
            <a href="/admin" className="font-semibold underline">
              Admin
            </a>
            <a href="/login" className="hover:underline">
              Login
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 flex flex-col gap-4">
        <Card title="Admin akcije">
          <div className="flex flex-col gap-3">
            <CustomButton label="Upravljanje FAQ" onClick={handleManageFaq} />
            <CustomButton
              label="Upravljanje destinacijama"
              onClick={handleManageDestinations}
            />
            <CustomButton label="Prikaz korisnika" onClick={handleViewUsers} />
          </div>
        </Card>
      </main>
    </div>
  );
}
