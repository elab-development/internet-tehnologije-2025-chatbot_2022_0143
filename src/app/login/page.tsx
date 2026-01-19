"use client";

import { useState } from "react";
import CustomButton from "../components/CustomButton";
import InputField from "../components/InputField";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // NEMA event parametra
  const handleLogin = () => {
    alert(`Login za: ${email}`);
  };

  const handleRegister = () => {
    alert(`Registracija za: ${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Login / Registracija
        </h1>

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
    </div>
  );
}
