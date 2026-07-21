import React from "react";

export function Empty({ text }) {
  return (
    <div className="rounded-md border border-dashed border-zinc-800 bg-black/50 px-4 py-5 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}
