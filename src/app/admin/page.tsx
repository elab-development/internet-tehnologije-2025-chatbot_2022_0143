"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CustomButton from "../components/CustomButton";

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        const roleName = data?.user?.roleName ?? data?.roleName;

        if (roleName !== "ADMIN") {
          router.replace("/");
          return;
        }
      } catch {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    }

    checkAdmin();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5]">
        <p className="text-slate-700 text-sm">Provera administratorskih prava...</p>
      </div>
    );
  }

  const handleManageFaq = () => {
    router.push("/admin/faq");
  };


  const handleManageDestinations = () => {
    router.push("/admin/destinacije");
  };

  const handleUsers = () => {
    router.push("/admin/korisnici")
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
      

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white/85 backdrop-blur-xl shadow-xl rounded-2xl p-8 w-full max-w-md border border-slate-100 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Admin panel
          </h2>

          <div className="flex flex-col gap-3">
            <CustomButton label="Upravljanje Q&A" onClick={handleManageFaq} />
            <CustomButton
              label="Upravljanje destinacijama"
              onClick={handleManageDestinations}
            />
            <CustomButton label="Pregled korisnika" onClick={handleUsers} />
          </div>

          
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
