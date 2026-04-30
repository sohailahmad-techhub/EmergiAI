"use client";

import { useEmergencyStore } from "@/store/useEmergencyStore";
import { Globe, ShieldAlert } from "lucide-react";

export default function Navbar() {
  const { language, setLanguage } = useEmergencyStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-center pointer-events-none">
      <div className="w-full max-w-5xl flex items-center justify-between px-6 py-3 glass-card rounded-[2rem] shadow-2xl border-white/20 pointer-events-auto backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-xl shadow-brand-green/20">
            <ShieldAlert size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
              EmergiAI
            </span>
            <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest">
              Emergency Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-brand-green/30 transition-all cursor-pointer">
              <Globe size={16} className="text-brand-green" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent border-none focus:ring-0 cursor-pointer outline-none text-sm font-black text-slate-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="ur">اردو</option>
                <option value="ps">پښتو</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
