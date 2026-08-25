import React from "react";

export function ThemeToggle({ theme, onToggle, labels }) {
  const isDark = theme === "dark";
  const nextThemeLabel = isDark ? labels.themeLight : labels.themeDark;

  return (
    // A largura fixa e o rótulo invisível replicam a estrutura do seletor de
    // idioma (label + controle), garantindo que os dois fiquem com a mesma
    // altura total e permaneçam alinhados em qualquer largura de tela.
    <div className="flex w-11 shrink-0 flex-col items-end">
      <span
        aria-hidden="true"
        className="mb-2 block select-none text-xs font-semibold uppercase tracking-wide text-transparent"
      >
        .
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${labels.toggleTheme} ${nextThemeLabel}`}
        title={`${labels.toggleTheme} ${nextThemeLabel}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition hover:border-purple-400 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:text-purple-200"
      >
        {isDark ? (
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="4.2" />
            <path
              strokeLinecap="round"
              d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
            />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
