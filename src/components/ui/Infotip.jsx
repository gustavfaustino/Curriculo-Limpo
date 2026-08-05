import React, { useEffect, useId, useRef, useState } from "react";

export function Infotip({ text, label = "Ajuda" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!text) return null;

  return (
    <span ref={containerRef} className="relative ml-2 inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        aria-controls={tooltipId}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-zinc-500/80 text-[10px] font-semibold text-zinc-200 transition hover:border-purple-400 hover:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
      >
        ?
      </button>

      {isOpen && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-64 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-normal normal-case leading-5 tracking-normal text-zinc-200 shadow-xl shadow-black/40"
        >
          {text}
        </span>
      )}
    </span>
  );
}
