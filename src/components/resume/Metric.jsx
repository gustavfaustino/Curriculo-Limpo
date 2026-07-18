// src/components/resume/Metric.jsx
import React from "react";

export function Metric({ value, label }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-black/50 p-3">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </p>
    </div>
  );
}
