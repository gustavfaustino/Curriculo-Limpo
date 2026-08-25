import { useEffect, useState } from "react";

const THEME_KEY = "ats_resume_theme_v1";

const getInitialTheme = () => {
    try {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === "light" || stored === "dark") return stored;
    } catch {
        // localStorage indisponível, segue com o padrão.
    }
    if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: light)").matches
            ? "light"
            : "dark";
    }
    return "dark";
};

export function useTheme() {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        root.style.colorScheme = theme;
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
            // Ignora falha de armazenamento (ex: modo privado).
        }
    }, [theme]);

    const toggleTheme = () =>
        setTheme((current) => (current === "dark" ? "light" : "dark"));

    return [theme, toggleTheme];
}
