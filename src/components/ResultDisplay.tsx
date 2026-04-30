"use client";

import { useEmergencyStore } from "@/store/useEmergencyStore";
import { translations } from "@/lib/translations";
import { AlertTriangle, CheckCircle2, PhoneCall, Info, MapPin, Navigation, ShieldCheck, Map as MapIcon } from "lucide-react";
import { motion } from "framer-motion";
import HospitalMap from "./HospitalMap";

export default function ResultDisplay() {
  const { language, result, reset } = useEmergencyStore();
  const t = translations[language];

  if (!result) return null;

  const severityColors = {
    Low: "bg-blue-100 text-white border-blue-200",
    Medium: "bg-amber-100 text-white border-amber-200",
    Critical: "bg-red-100 text-white border-red-200 animate-pulse shadow-lg shadow-red-200/50",
  };

  const severityIcons = {
    Low: <Info size={24} />,
    Medium: <AlertTriangle size={24} />,
    Critical: <AlertTriangle size={24} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-3xl mx-auto px-6 mt-12 mb-20 group"
    >
      {/* Background Glow */}
      <div className={`absolute inset-0 blur-[60px] opacity-20 -z-10 transition-colors duration-500 ${
        result.severity === 'Critical' ? 'bg-red-500' : 
        result.severity === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'
      }`} />

      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-2xl border-white/20 backdrop-blur-2xl">
        {/* Severity Header */}
        <div className={`px-8 py-6 flex items-center justify-between transition-colors ${severityColors[result.severity]}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              {severityIcons[result.severity]}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-70">
                Urgency Level
              </p>
              <h2 className={`text-2xl font-bold ${language !== 'en' ? 'urdu-text' : ''}`}>
                {result.severity === 'Critical' ? t.critical : result.severity === 'Medium' ? t.medium : t.low}
              </h2>
            </div>
          </div>
          <button 
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-bold backdrop-blur-md"
          >
            {language === 'en' ? 'Reset' : 'دوبارہ'}
          </button>
        </div>

        <div className="p-8 space-y-10">
          {/* Immediate Actions */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green">
                <ShieldCheck size={28} />
              </div>
              <h3 className={`text-xl font-semibold text-white ${language !== 'en' ? 'urdu-text' : ''}`}>
                {t.actions}
              </h3>
            </div>
            
            <div className="grid gap-4">
              {result.actions.map((action, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group/item hover:border-brand-green/30 transition-colors ${language !== 'en' ? 'urdu-text' : ''}`}
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-brand-green/10 text-brand-green font-black text-sm group-hover/item:scale-110 transition-transform">
                    {idx + 1}
                  </span>
                  <p className="text-white font-normal leading-relaxed text-lg">
                    {action}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Next Steps Card */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-emerald-900/80 to-teal-900/80 border border-brand-green/30 text-white shadow-2xl backdrop-blur-md"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <PhoneCall className="text-brand-green" size={24} />
                <h3 className={`text-xl font-bold ${language !== 'en' ? 'urdu-text' : ''}`}>
                  {t.suggestions}
                </h3>
              </div>
              <p className={`text-white text-lg font-normal leading-relaxed ${language !== 'en' ? 'urdu-text' : ''}`}>
                {result.nextSteps}
              </p>
              {result.localAdvice && (
                <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10 text-emerald-50 font-normal italic backdrop-blur-sm">
                  <span className="text-xl mr-2">💡</span> {result.localAdvice}
                </div>
              )}
            </div>
            {/* Decorative circle */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-green/20 rounded-full blur-3xl" />
          </motion.section>

          {/* Nearby Hospitals - Ultra Modern List */}
          {result.hospitals && result.hospitals.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                    <MapPin size={24} />
                  </div>
                  <h3 className={`text-xl font-black text-white ${language !== 'en' ? 'urdu-text' : ''}`}>
                    {t.nearbyHospitals}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-brand-green bg-brand-green/10 px-3 py-1 rounded-full">
                  <MapIcon size={14} />
                  Interactive Map
                </div>
              </div>

              {/* Interactive Map Integration */}
              <HospitalMap />

              <div className="grid gap-4">
                {result.hospitals.map((hospital, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/10 shadow-sm hover:shadow-xl transition-all group/hosp backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 items-center justify-center text-2xl group-hover/hosp:bg-brand-green/10 transition-colors">
                        🏥
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xl text-white leading-tight">
                          {hospital.name}
                        </h4>
                        <p className="text-sm font-normal text-slate-200 max-w-xs">
                          {hospital.address}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold flex items-center gap-1">
                            <Navigation size={12} />
                            {hospital.distance}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full md:w-auto py-3 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-brand-green text-sm font-bold text-center hover:bg-brand-green hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Navigation size={14} />
                      {language === 'en' ? 'Get Directions' : 'راستہ دیکھیں'}
                    </a>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </motion.div>
  );
}
