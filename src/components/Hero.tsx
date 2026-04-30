"use client";

import { useEmergencyStore } from "@/store/useEmergencyStore";
import { translations } from "@/lib/translations";
import { motion } from "framer-motion";

export default function Hero() {
  const { language } = useEmergencyStore();
  const t = translations[language];

  return (
    <div className="relative pt-32 pb-16 px-6 flex flex-col items-center text-center overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-brand-green/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-40 -right-20 w-[400px] h-[400px] bg-brand-teal/10 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />
      
      {/* Floating UI Elements for Depth */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-40 left-[10%] hidden lg:block glass-card p-4 rounded-2xl shadow-2xl border-white/20 rotate-[-5deg]"
      >
        <div className="flex items-center gap-3 text-red-500 font-bold">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
          Critical Alert
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        className="absolute top-60 right-[10%] hidden lg:block glass-card p-4 rounded-2xl shadow-2xl border-white/20 rotate-[5deg]"
      >
        <div className="flex items-center gap-3 text-brand-green font-bold">
          <div className="w-8 h-8 bg-brand-green/10 rounded-lg flex items-center justify-center">🏥</div>
          Nearby Help
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 text-sm font-semibold text-brand-green mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
          </span>
          Next-Gen Medical Emergency AI
        </div>

        <h1 className={`text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1] ${language !== 'en' ? 'urdu-text' : ''}`}>
          <span className="bg-clip-text text-transparent bg-brand-gradient">
            {t.title.split(' ')[0]}
          </span>
          <br />
          <span className="text-slate-900 dark:text-white">
            {t.title.split(' ').slice(1).join(' ')}
          </span>
        </h1>
        
        <p className={`text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed ${language !== 'en' ? 'urdu-text' : ''}`}>
          {t.subtitle}
        </p>
      </motion.div>
    </div>
  );
}
