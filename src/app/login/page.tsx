"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "../components/CustomButton";
import InputField from "../components/InputField";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      alert("Unesite email i lozinku.");
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("loggedIn", "1");
    }

    alert(`Login uspešan za: ${email}`);
    router.push("/admin");
  };

  const handleRegister = () => {
    alert(`Simulacija registracije za: ${email}`);
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
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
              className="inline-flex items-center px-3 py-1 rounded-full hover:bg-white/70 text-slate-700"
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
              className="inline-flex items-center px-3 py-1 rounded-full bg-white shadow-sm text-slate-900 font-semibold"
            >
              Login
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white/85 backdrop-blur-xl shadow-xl rounded-2xl p-8 w-full max-w-md border border-slate-100">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-900">
            Prijava / Registracija
          </h2>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <InputField
              label="Email"
              type="email"
              placeholder="Unesite email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputField
              label="Lozinka"
              type="password"
              placeholder="Unesite lozinku"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <CustomButton label="Login" onClick={handleLogin} />
              <CustomButton
                label="Registracija"
                variant="secondary"
                onClick={handleRegister}
              />
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="max-w-5xl mx-auto px-4 py-3 text-xs text-slate-500 flex justify-between">
          <span>© 2025 Travel Chatbot</span>
         
        </div>
      </footer>
    </div>
  );
}
