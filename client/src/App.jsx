import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "system"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const themes = [
    { name: "light", icon: <Sun title="Light Theme" size={14} /> },
    { name: "dark", icon: <Moon title="Dark Theme" size={14} /> },
    { name: "system", icon: <Laptop title="System Theme" size={14} /> },
  ];

  return (
    <>
      <div className="theme-switcher" aria-label="Theme selector">
        {themes.map(({ name, icon }) => (
          <button
            aria-pressed={theme === name}
            aria-label={`${name} theme`}
            className={theme === name ? "active" : ""}
            key={name}
            onClick={() => setTheme(name)}
            type="button"
          >
            {icon}
          </button>
        ))}
      </div>
      <AppRoutes />
    </>
  );
}

export default App;
