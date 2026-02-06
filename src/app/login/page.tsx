"use client";

import { Suspense, useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CustomButton from "../components/CustomButton";
import InputField from "../components/InputField";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill email ako dođe sa /login?email=...
  useEffect(() => {
    const email = searchParams.get("email");
    if (email) setLoginEmail(email);
  }, [searchParams]);

  async function handleLogin() {
    if (!loginEmail || !loginPassword) {
      alert("Unesite email i lozinku.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "Neuspešno logovanje. Proverite kredencijale.";
        alert(msg);
        return;
      }

      const roleName = data?.roleName ?? data?.user?.roleName;

      if (roleName === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Došlo je do greške pri logovanju.");
    } finally {
      setLoading(false);
    }
  }

  function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    if (!loading) void handleLogin();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white/85 backdrop-blur-xl shadow-xl rounded-2xl p-8 w-full max-w-md border border-slate-100">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-900">
            Prijava
          </h2>

          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <InputField
              label="Email"
              type="email"
              placeholder="Unesite email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            <InputField
              label="Lozinka"
              type="password"
              placeholder="Unesite lozinku"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <CustomButton
                type="submit"
                label={loading ? "Prijavljivanje..." : "Login"}
                disabled={loading}
              />

              <CustomButton
                label="Registracija"
                variant="secondary"
                type="button"
                onClick={() => router.push("/login/registracija")}
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
