import React from "react";

export function Toggle({ label, checked, onChange }) {
  // Alternância ligada ou desligada.
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <span className="flex min-h-[44px] items-center gap-3 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-zinc-400 bg-white text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-black dark:text-purple-500"
          checked={!!checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{label}</span>
      </span>
    </label>
  );
}
