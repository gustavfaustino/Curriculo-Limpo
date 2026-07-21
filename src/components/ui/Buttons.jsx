import React from "react";

export function AddButton({ children, onClick, ariaLabel }) {
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
