"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "../../components/CustomButton";
import InputField from "../../components/InputField";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault();

    if (!regEmail || !regPassword) {
      alert("Email i lozinka su obavezni.");
      return;
    }

    if (!emailRegex.test(regEmail)) {
      alert("Email nije validnog formata.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          name: regName,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "Registracija nije uspela. Pokušajte ponovo.";
        alert(msg);
        return;
      }

      alert("Registracija uspešna! Sada se prijavite.");
      router.push(`/login?email=${encodeURIComponent(regEmail)}`);
    } catch (err) {
      console.error(err);
      alert("Došlo je do greške pri registraciji.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white/85 backdrop-blur-xl shadow-xl rounded-2xl p-8 w-full max-w-md border border-slate-100">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-900">
            Registracija
          </h2>

          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <InputField
              label="Ime"
              type="text"
              placeholder="Unesite ime"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
            />

            <InputField
              label="Email"
              type="email"
              placeholder="Unesite email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />

            <InputField
              label="Lozinka"
              type="password"
              placeholder="Unesite lozinku"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <CustomButton
                type="submit"
                label={loading ? "Registrujem..." : "Registruj se"}
                disabled={loading}
              />

              <CustomButton
                label="Nazad na login"
                variant="secondary"
                type="button"
                onClick={() => router.push("/login")}
                disabled={loading}
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
