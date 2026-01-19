"use client";

import React from "react";

type CustomButtonProps = {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
};

export default function CustomButton({
  label,
  onClick,
  type = "button",
  variant = "primary",
}: CustomButtonProps) {
  const baseClasses =
    "px-4 py-2 rounded-md text-sm font-medium transition-colors";

  const variantClasses =
    variant === "secondary"
      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
      : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      {label}
    </button>
  );
}
