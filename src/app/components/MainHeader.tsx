"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id?: number;
  email?: string;
  roleName?: string; // "ADMIN" | "USER" | "GUEST" | undefined
};

export default function MainHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // svaki put kad promeniš stranicu, proveri ponovo /api/auth/me
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json().catch(() => null);
        setUser(data?.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, [pathname]);

  const isAdmin = user?.roleName === "ADMIN";

  const handleAdminClick = () => {
    if (loading) return;

    if (!isAdmin) {
      alert("Niste administrator.");
      // ostaješ na stranici na kojoj jesi
      return;
    }

    router.push("/admin");
  };

  const handleLoginClick = () => {
    if (loading) return;

    if (user) {
      alert("Već ste prijavljeni.");
      // ne ide na /login
      return;
    }

    router.push("/login");
  };

  const navPillClass =
    "px-4 py-2 rounded-full text-sm text-slate-800 hover:bg-white/70 bg-white/40 shadow-sm transition";

  return (
    <header className="w-full">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-semibold text-slate-800 hover:opacity-80 transition"
        >
          Travel Chatbot
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/" className={navPillClass}>
            Chat
          </Link>

          <Link href="/destinacija" className={navPillClass}>
            Destinacije
          </Link>

          <button
            type="button"
            onClick={handleAdminClick}
            className={navPillClass}
          >
            Admin
          </button>

          <button
            type="button"
            onClick={handleLoginClick}
            className={navPillClass}
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  );
}
