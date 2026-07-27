import React from "react";

export function Choice({
  label,
  value,
  onChange,
  options,
  className = "",
  required = false,
  error = false,
  tooltip = "",
}) {
  // Seletor de uma opção em lista suspensa.
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 flex items-center text-xs font-semibold uppercase tracking-wide text-zinc-400">
        <span>{label}</span>
        {required && <span className="ml-1 text-red-400">*</span>}
        {tooltip && (
          <span
            className="ml-2 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-500/80 text-[10px] text-zinc-200 cursor-help"
            title={tooltip}
          >
            ?
          </span>
        )}
      </span>

      <div className="relative w-full">
        <select
          className={`min-h-[44px] w-full appearance-none rounded-md border bg-zinc-950 pl-3 pr-10 text-sm text-zinc-100 outline-none transition focus:ring-2 cursor-pointer ${
            error
              ? "border-red-500 focus:border-red-400 focus:ring-red-500/30"
              : "border-zinc-800 focus:border-purple-400 focus:ring-purple-500/30"
          }`}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error || undefined}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div
          className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-zinc-400"
          aria-hidden="true"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </label>
  );
}
