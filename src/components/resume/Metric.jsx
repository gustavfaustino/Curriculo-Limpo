import React from "react";

export function Metric({ value, label, tooltip }) {
  return (
    <div
      className="rounded-md border border-zinc-800 bg-black/50 p-3"
      title={tooltip}
    >
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </p>
    </div>
  );
}
