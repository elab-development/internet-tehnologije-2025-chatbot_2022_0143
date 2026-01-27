"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type UserDto = {
  id: number;
  email: string;
  name: string | null;
  roleName: string | null;
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // polja za novog admina
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const router = useRouter();

  // ------------------- učitavanje korisnika -------------------
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/admin/users", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401 || res.status === 403) {
          alert("Nemate dozvolu da pristupite ovoj stranici.");
          router.push("/");
          return;
        }

        if (!res.ok) {
          throw new Error("Greška pri učitavanju korisnika.");
        }

        const data = await res.json();
        setUsers(data.users ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Greška pri učitavanju korisnika.");
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, [router]);

  // ------------------- slanje forme za novog admina -------------------
  async function handleCreateAdmin(e: FormEvent) {
    e.preventDefault();
    if (creating) return;

    if (!newEmail || !newPassword) {
      alert("Email i lozinka su obavezni za novog admina.");
      return;
    }

    if (!emailRegex.test(newEmail)) {
        alert("Email za novog admina nije validnog formata.");
        return;
    }

    try {
      setCreating(true);

      const res = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName || null,
          email: newEmail,
          password: newPassword,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        alert("Nemate dozvolu da kreirate administratore.");
        router.push("/");
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.message ?? "Greška pri kreiranju novog admina.";
        alert(msg);
        return;
      }

      const created: UserDto = data.user;

      // dodaj novog admina u tabelu
      setUsers((prev) => [...prev, created]);

      // očisti formu
      setNewName("");
      setNewEmail("");
      setNewPassword("");

      alert(`Novi admin je kreiran: ${created.email}`);
    } catch (e) {
      alert("Došlo je do greške pri kreiranju novog admina.");
    } finally {
      setCreating(false);
    }
  }

  // ------------------- UI -------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white/85 backdrop-blur-xl shadow-xl rounded-2xl p-8 w-full max-w-4xl border border-slate-100 space-y-6">
          <h1 className="text-2xl font-bold text-center text-slate-900">
            Pregled korisnika
          </h1>

          {/* Forma za novog admina */}
          <section className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
            <h2 className="text-lg font-semibold mb-3 text-slate-900">
              Dodavanje novog administratora
            </h2>
            

            <form
              onSubmit={handleCreateAdmin}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  Ime 
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-white"
                  placeholder="npr. Marko"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-white"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  Lozinka *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-white"
                  placeholder="Unesite lozinku"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed px-5 py-2 text-sm font-semibold text-white shadow-sm transition"
                >
                  {creating ? "Kreiranje..." : "Kreiraj admina"}
                </button>
              </div>
            </form>
          </section>

          {/* Tabela korisnika */}
          {loading && (
            <div className="text-center text-slate-600">Učitavanje...</div>
          )}

          {!loading && error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="text-center text-slate-600">
              Trenutno nema registrovanih korisnika.
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Ime</th>
                    <th className="px-3 py-2">Uloga</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-100 hover:bg-slate-50/80"
                    >
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {u.id}
                      </td>
                      <td className="px-3 py-2 font-medium">{u.email}</td>
                      <td className="px-3 py-2">{u.name ?? "-"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.roleName === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : u.roleName === "REGISTROVANI_KORISNIK"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.roleName ?? "Nepoznata"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
