export const THEME_KEY = "aprobaciones-theme";

export const themeInitScript = `(function(){try{var s=localStorage.getItem("${THEME_KEY}");var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function isDarkTheme() {
  return document.documentElement.classList.contains("dark");
}

export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

export function resolveDark(stored: string | null, prefersDark: boolean) {
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return prefersDark;
}

export function persistTheme(dark: boolean) {
  try {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch {
    // almacenamiento no disponible
  }
  applyTheme(dark);
}
