"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, isDarkTheme, persistTheme, readStoredTheme } from "@/lib/theme";

export function ThemeToggle({ className = "ui-iconbtn" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(isDarkTheme());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function onSystemChange() {
      if (readStoredTheme()) return;
      applyTheme(media.matches);
      setDark(media.matches);
    }
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  function toggle() {
    const next = !isDarkTheme();
    persistTheme(next);
    setDark(next);
  }

  return (
    <button
      type="button"
      className={className}
      title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={toggle}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
