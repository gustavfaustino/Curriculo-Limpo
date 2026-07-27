import React from "react";

export function ItemBlock({
  title,
  subtitle,
  onRemove,
  removeLabel,
  children,
}) {
  // Card para um item repetível como experiência ou certificado.
  return (
    <article className="rounded-md border border-zinc-800 bg-black/60 p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-100">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 truncate text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 transition hover:border-purple-400 hover:text-white"
        >
          {removeLabel}
        </button>
      </div>
      {children}
    </article>
  );
}
