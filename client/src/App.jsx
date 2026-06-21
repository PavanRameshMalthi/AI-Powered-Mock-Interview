import { useEffect, useState } from "react";
import { FaSun, FaMoon, FaLaptop } from "react-icons/fa";
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
    { name: "light", icon: <FaSun title="Light Theme" /> },
    { name: "dark", icon: <FaMoon title="Dark Theme" /> },
    { name: "system", icon: <FaLaptop title="System Theme" /> },
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
