import {useState} from "react";
import Icon from "./Icon";

type Theme = "light" | "dark";

const STORAGE_KEY = "pdf-presenter-theme";

/**
 * Returns the theme chosen by the user, falling back to the system preference.
 */
function getInitialTheme(): Theme {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark") return stored;
    } catch {
        // Storage can be unavailable (e.g. blocked site data), use the system preference instead
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Applies a theme by setting `data-theme` on the root element (see `index.css`).
 */
export function applyTheme(theme: Theme = getInitialTheme()) {
    document.documentElement.dataset.theme = theme;
}

/**
 * Icon button switching between light and dark mode. The choice is remembered.
 */
export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    function toggleTheme() {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // The choice is just not remembered
        }
    }

    const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

    return (
        <button className={"icon-button"} onClick={toggleTheme} aria-label={label} title={label}>
            <Icon name={theme === "dark" ? "lightMode" : "darkMode"} />
        </button>
    );
}
