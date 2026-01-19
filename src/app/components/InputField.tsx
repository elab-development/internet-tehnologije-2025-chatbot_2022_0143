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
    <div className="flex flex-col">
      {!hideLabel && (
        <label className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
