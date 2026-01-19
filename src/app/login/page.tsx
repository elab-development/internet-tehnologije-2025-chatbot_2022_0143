"use client";

import { useState } from "react";
import CustomButton from "../components/CustomButton";
import InputField from "../components/InputField";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    alert(`Login za: ${email}`);
  };

  const handleRegister = () => {
    alert(`Registracija za: ${email}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* HEADER SA MENIJEM – ISTI KAO NA HOME */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Travel Chatbot</h1>
          <nav className="space-x-4 text-sm">
            <a href="/" className="hover:underline">
              Chat
            </a>
            <a href="/destinacija" className="hover:underline">
              Destinacije
            </a>
            <a href="/admin" className="hover:underline">
              Admin
            </a>
            <a href="/login" className="font-semibold underline">
              Login
            </a>
          </nav>
        </div>
      </header>

      {/* FORMA ZA LOGIN/REG */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Login / Registracija
          </h2>

          <form className="space-y-4">
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
    </div>
  );
}
