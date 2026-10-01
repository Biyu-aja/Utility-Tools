import React from "react";
import { Sun, Moon } from "lucide-react";
import { useApp } from "../context/AppContext";

const ThemeToogle:React.FC = () => {
    const { theme, toggleTheme } = useApp()
    return (
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-2 rounded-xl bg-bg-hover hover:bg-bg-hover/80 text-text-main transition-colors cursor-pointer flex items-center justify-center border border-border-main"
        >
          {theme === 'dark' ? (
            <Sun className="w-4.5 h-4.5 text-amber-400" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-slate-600" />
          )}
        </button>
    )
}

export default ThemeToogle