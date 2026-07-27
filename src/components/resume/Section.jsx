import React from "react";

export function Section({ id, title, active, children, description = "" }) {
  if (id !== active) return null;
  // Conteúdo de uma seção do currículo.
  return (
    <section
      id={`section-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl shadow-purple-950/20 md:p-6"
    >
      <div className="mb-6 flex gap-3">
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-purple-400" />
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-6 text-zinc-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

