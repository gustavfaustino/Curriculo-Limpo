// src/components/resume/Section.jsx
import React from "react";

export function Section({ id, title, active, children }) {
  if (id !== active) return null;
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl shadow-purple-950/20 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-purple-400" />
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}