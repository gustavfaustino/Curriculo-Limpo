import React from "react";

export function AddButton({ children, onClick, ariaLabel }) {
  // Botão para adicionar novos itens ao formulário.
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="mt-4 min-h-[42px] rounded-md bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
    >
      {children}
    </button>
  );
}

const ICON_BUTTON_VARIANTS = {
  neutral:
    "border-zinc-300 text-zinc-600 hover:border-purple-400 hover:text-purple-600 focus:ring-purple-500/40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-purple-200",
  danger:
    "border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50 hover:text-red-700 focus:ring-red-500/40 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-200",
};

export function IconButton({
  children,
  onClick,
  ariaLabel,
  disabled,
  title,
  variant = "neutral",
  className = "",
}) {
  // Botão compacto usado para ações secundárias, como reordenar ou remover itens.
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-30 ${ICON_BUTTON_VARIANTS[variant] || ICON_BUTTON_VARIANTS.neutral} ${className}`}
    >
      {children}
    </button>
  );
}
