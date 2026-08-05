import React from "react";
import { Infotip } from "./Infotip";

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
  // Campo de texto grande para descrições e resumos.
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 flex items-center text-xs font-semibold uppercase tracking-wide text-zinc-400">
        <span>{label}</span>
        {required && <span className="ml-1 text-red-400">*</span>}
        {tooltip && <Infotip text={tooltip} label={`${label}: ajuda`} />}
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
