import React from "react";

export function Toggle({ label, checked, onChange }) {
  // Alternância ligada ou desligada.
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      <span className="flex min-h-[44px] items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-zinc-700 bg-black text-purple-500 focus:ring-purple-500"
          checked={!!checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{label}</span>
      </span>
    </label>
  );
}
