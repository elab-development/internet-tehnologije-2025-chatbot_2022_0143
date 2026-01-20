"use client";

import React from "react";

type InputFieldProps = {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hideLabel?: boolean;
};

export default function InputField({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  hideLabel = false,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {!hideLabel && (
        <label className="text-xs font-semibold tracking-wide uppercase text-slate-500">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
      />
    </div>
  );
}
