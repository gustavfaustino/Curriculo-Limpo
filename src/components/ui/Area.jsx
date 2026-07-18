// src/components/ui/Area.jsx
import React from "react";

export function Area({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  className = "",
  required = false,
  error = false,
  tooltip = "",
  onBlur,
  onFocus,
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
        {required && <span className="text-red-400"> *</span>}
        {tooltip && (
          <span
            className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-zinc-500/80 text-[10px] text-zinc-200 cursor-help"
            title={tooltip}
            aria-label={tooltip}
          >
            ?
          </span>
        )}
      </span>
      <textarea
        className={`w-full rounded-md border bg-zinc-950 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none transition focus:ring-2 ${
          error
            ? "border-red-500 focus:border-red-400 focus:ring-red-500/30"
            : "border-zinc-800 focus:border-purple-400 focus:ring-purple-500/30"
        }`}
        rows={rows}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        onBlur={onBlur}
        onFocus={onFocus}
        aria-invalid={error || undefined}
      />
    </label>
  );
}
