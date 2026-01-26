"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } finally {
        router.replace("/login");
        router.refresh(); // Ovo je važno!
      }
    })();
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-slate-700 text-sm">Odjavljivanje...</p>
    </div>
  );
}
