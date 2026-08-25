import React from "react";

export function Metric({ value, label, tooltip }) {
  return (
    <div
      className="rounded-md border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-black/50"
      title={tooltip}
    >
      <p className="text-2xl font-semibold text-zinc-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        {label}
      </p>
    </div>
  );
}
