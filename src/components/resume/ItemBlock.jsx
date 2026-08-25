import React from "react";
import { IconButton } from "../ui/Buttons";

export function ItemBlock({
  title,
  subtitle,
  onRemove,
  removeLabel,
  children,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  moveUpLabel = "Mover para cima",
  moveDownLabel = "Mover para baixo",
}) {
  const canReorder = typeof onMoveUp === "function" || typeof onMoveDown === "function";

  // Card para um item repetível como experiência ou certificado.
  return (
    <article className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black/60">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-500">{subtitle}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {canReorder && (
            <div className="flex items-center gap-1" role="group" aria-label={moveUpLabel}>
              <IconButton
                onClick={onMoveUp}
                disabled={!canMoveUp}
                ariaLabel={moveUpLabel}
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                  <path d="M10 5.5a1 1 0 01.7.3l4.5 4.5a1 1 0 11-1.4 1.4L10 7.9l-3.8 3.8a1 1 0 11-1.4-1.4l4.5-4.5a1 1 0 01.7-.3z" />
                </svg>
              </IconButton>
              <IconButton
                onClick={onMoveDown}
                disabled={!canMoveDown}
                ariaLabel={moveDownLabel}
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                  <path d="M10 14.5a1 1 0 01-.7-.3l-4.5-4.5a1 1 0 111.4-1.4L10 12.1l3.8-3.8a1 1 0 111.4 1.4l-4.5 4.5a1 1 0 01-.7.3z" />
                </svg>
              </IconButton>
            </div>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 transition hover:border-red-500 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-200"
          >
            {removeLabel}
          </button>
        </div>
      </div>
      {children}
    </article>
  );
}
