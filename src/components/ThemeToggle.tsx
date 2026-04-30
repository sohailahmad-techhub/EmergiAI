"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-3 w-11 h-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-3 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg group"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        {theme === "dark" ? (
          <Moon size={20} className="text-brand-teal group-hover:text-white transition-colors" />
        ) : (
          <Sun size={20} className="text-amber-500 group-hover:text-amber-600 transition-colors" />
        )}
      </motion.div>
    </button>
  );
}
