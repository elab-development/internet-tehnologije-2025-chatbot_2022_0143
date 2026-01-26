"use client";

import React from "react";

type CustomButtonProps = {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean; // <-- DODATO
};

export default function CustomButton({
  label,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false, // <-- DODATO
}: CustomButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium text-sm rounded-xl px-4 py-2 transition-all duration-200 focus-visible:outline-none";

  const style =
    variant === "secondary"
      ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300"
      : variant === "ghost"
      ? "bg-transparent text-slate-600 hover:bg-slate-100"
      : "bg-[#FFE4B5] text-slate-800 hover:bg-[#E6CB9F] focus-visible:ring-2 focus-visible:ring-[#FFE4B5] shadow-md";

  // stil za disabled (možeš pojačati po želji)
  const disabledStyle = "opacity-50 cursor-not-allowed hover:none";

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick} // sprečava klik kad je disabled
      disabled={disabled} // nativno disabled stanje
      className={`${base} ${style} ${disabled ? disabledStyle : ""}`}
    >
      {label}
    </button>
  );
}
