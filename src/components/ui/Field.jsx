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
  maxLength,
}) {
  // Campo de texto simples com validação visual e limite de caracteres opcional.
  const handleChange = (event) => {
    const next = event.target.value;
    onChange(maxLength ? next.slice(0, maxLength) : next);
  };

  return (
    <label className={`block ${className}`}>
      <span className="mb-2 flex items-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        <span>{label}</span>
        {required && <span className="ml-1 text-red-500 dark:text-red-400">*</span>}
        {tooltip && <Infotip text={tooltip} label={`${label}: ajuda`} />}
      </span>
      <input
        className={`min-h-[44px] w-full rounded-md border bg-white px-3 text-sm text-zinc-900 outline-none transition focus:ring-2 dark:bg-zinc-950 dark:text-zinc-100 ${
          error
            ? "border-red-500 focus:border-red-400 focus:ring-red-500/30"
            : "border-zinc-300 focus:border-purple-400 focus:ring-purple-500/30 dark:border-zinc-800"
        }`}
        type={type}
        value={value || ""}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={error || undefined}
      />
      {errorMessage && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-300">
          {errorMessage}
        </p>
      )}
    </label>
  );
}
