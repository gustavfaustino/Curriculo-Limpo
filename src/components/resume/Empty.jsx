import React from "react";

export function Empty({ text }) {
  return (
    <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50/60 px-4 py-5 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-black/50 dark:text-zinc-500">
      {text}
    </div>
  );
}
