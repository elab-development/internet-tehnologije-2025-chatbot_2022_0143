"use client";

import React, { ReactNode } from "react";

type CardProps = {
  title: string;
  children: ReactNode;
};

const CARD_CLASSES =
  "bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-lg p-5 md:p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl";

export default function Card({ title, children }: CardProps) {
  return (
    <section className={CARD_CLASSES}>
      <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-3">
        {title}
      </h2>
      <div className="text-sm text-slate-700 space-y-3">{children}</div>
    </section>
  );
}
