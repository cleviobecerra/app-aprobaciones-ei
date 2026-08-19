"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type UiSelectOption = { value: string; label: string };

export function UiSelect({
  name,
  options,
  defaultValue = "",
  value,
  onChange,
  id,
}: {
  name?: string;
  options: UiSelectOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
}) {
  const generatedId = useId();
  const listId = `${generatedId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const current = options.find((option) => option.value === selected) ?? options[0];

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function choose(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      {name ? <input type="hidden" name={name} value={selected} /> : null}
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="ui-input flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="min-w-0 truncate">{current?.label ?? "Seleccionar"}</span>
        <ChevronDown className={`size-4 shrink-0 text-subtle transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-2 w-full rounded-2xl border border-line bg-surface p-1.5 shadow-xl shadow-fg/10"
        >
          {options.map((option) => {
            const active = option.value === selected;
            return (
              <li key={option.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => choose(option.value)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    active ? "bg-primary font-medium text-white" : "text-fg hover:bg-soft"
                  }`}
                >
                  {option.label}
                  {active ? <Check className="size-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
