"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "../components/CustomButton";
import Card from "../components/Card";

export default function AdminPage() {
  const router = useRouter();

  // Zaštita rute – ako nije "ulogovan", šalji na /login
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isLoggedIn = window.localStorage.getItem("loggedIn") === "1";
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  const handleManageFaq = () => {
    alert("Ovde će kasnije biti upravljanje FAQ pitanjima (CRUD preko backenda).");
  };

  const handleManageDestinations = () => {
    alert("Ovde će kasnije biti CRUD nad destinacijama u bazi.");
  };

  const handleViewUsers = () => {
    alert("Ovde će kasnije biti spisak korisnika (admin-only).");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("loggedIn");
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 py-4">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Admin panel
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
              className="inline-flex items-center px-3 py-1 rounded-full hover:bg-white/70 text-slate-700"
            >
              Destinacije
            </a>
            <a
              href="/admin"
              className="inline-flex items-center px-3 py-1 rounded-full bg-white shadow-sm text-slate-900 font-semibold"
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
        <Card title="Administratorske akcije">
          <div className="flex flex-col gap-3">
            <CustomButton label="Upravljanje FAQ" onClick={handleManageFaq} />
            <CustomButton
              label="Upravljanje destinacijama"
              onClick={handleManageDestinations}
            />
            <CustomButton label="Pregled korisnika" onClick={handleViewUsers} />
            <CustomButton
              label="Logout"
              variant="secondary"
              onClick={handleLogout}
            />
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
