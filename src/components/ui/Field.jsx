import React from "react";
import { Infotip } from "./Infotip";

export function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  required = false,
  error = false,
  errorMessage = "",
  tooltip = "",
  className = "",
}) {
  // Campo de texto simples com validação visual.
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 flex items-center text-xs font-semibold uppercase tracking-wide text-zinc-400">
        <span>{label}</span>
        {required && <span className="ml-1 text-red-400">*</span>}
        {/* {tooltip && (
          <span
            className="ml-2 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-500/80 text-[10px] text-zinc-200 cursor-help"
            title={tooltip}
          >
            ?
          </span>
        )} */}
        {tooltip && <Infotip text={tooltip} label={`${label}: ajuda`} />}
      </span>
      <input
        className={`min-h-[44px] w-full rounded-md border bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition focus:ring-2 ${
          error
            ? "border-red-500 focus:border-red-400 focus:ring-red-500/30"
            : "border-zinc-800 focus:border-purple-400 focus:ring-purple-500/30"
        }`}
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={error || undefined}
      />
      {errorMessage && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {errorMessage}
        </p>
      )}
    </label>
  );
}
