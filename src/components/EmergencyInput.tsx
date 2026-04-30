"use client";

import { useEmergencyStore } from "@/store/useEmergencyStore";
import { translations } from "@/lib/translations";
import { Mic, Send, StopCircle, AlertCircle, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EmergencyInput() {
  const { language, input, setInput, isRecording, setRecording, isProcessing, setProcessing, setResult, setLocation, location } = useEmergencyStore();
  const t = translations[language];
  const [localInput, setLocalInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const getGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          switch(err.code) {
            case err.PERMISSION_DENIED:
              console.warn("User denied the request for Geolocation.");
              break;
            case err.POSITION_UNAVAILABLE:
              console.warn("Location information is unavailable.");
              break;
            case err.TIMEOUT:
              console.warn("The request to get user location timed out.");
              break;
            default:
              console.warn("An unknown geolocation error occurred.");
              break;
          }
        },
        { timeout: 10000 }
      );
    }
  };

  // Fetch location on mount
  useEffect(() => {
    getGeolocation();
  }, []);

  const handleAnalyze = async (textToAnalyze?: string) => {
    const finalInput = textToAnalyze || localInput;
    if (!finalInput.trim()) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          input: finalInput, 
          language,
          latitude: location?.lat,
          longitude: location?.lng
        }),
      });
      
      if (!res.ok) throw new Error("Failed to analyze emergency");
      
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        await handleVoiceUpload(audioBlob);
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const handleVoiceUpload = async (blob: Blob) => {
    setProcessing(true);
    const formData = new FormData();
    formData.append("file", blob, "audio.wav");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Transcription failed");
      
      const { text } = await res.json();
      setLocalInput(text);
      handleAnalyze(text);
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6">
      <div className="glass-card p-4 rounded-3xl shadow-xl border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-3 mb-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-inner">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-xl ${location ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-brand-green/10 text-brand-green'}`}>
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Current Location</p>
              <p className="text-sm font-black text-slate-900 dark:text-white leading-none mt-0.5">
                {location 
                  ? (language === 'en' ? 'Detected Successfully' : 'مقام معلوم ہو گیا')
                  : (language === 'en' ? 'Not Shared' : 'مقام معلوم نہیں ہے')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!location ? (
              <>
                <input 
                  type="text"
                  placeholder={language === 'en' ? "Enter City Name..." : "شہر کا نام درج کریں..."}
                  className="bg-white dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-brand-green/50 w-full sm:w-40 transition-all shadow-sm"
                  onChange={(e) => {
                    setLocalInput(prev => prev.includes('Location:') ? prev : `${prev} (Location: ${e.target.value})`);
                  }}
                />
                <button
                  onClick={() => getGeolocation()}
                  className="whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-green text-white text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-green/20"
                >
                  <MapPin size={14} />
                  {language === 'en' ? 'Use GPS' : 'GPS استعمال کریں'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setLocation(null)}
                className="text-[10px] font-bold text-red-500 hover:underline"
              >
                {language === 'en' ? 'Clear Location' : 'مقام صاف کریں'}
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-32 h-32 bg-red-500 rounded-full"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                className="w-32 h-32 bg-red-400 rounded-full"
              />
            </div>
          )}
          
          <textarea
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder={t.inputPlaceholder}
            className={`w-full min-h-[200px] bg-white dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-green/20 focus:border-brand-green text-xl font-normal text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none p-6 transition-all shadow-inner ${isRecording ? 'opacity-30' : 'opacity-100'} ${language !== 'en' ? 'urdu-text' : ''}`}
          />
          
          <div className="flex items-center justify-between mt-4 p-2 border-t border-slate-100/50 dark:border-slate-800/50">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`group flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${
                isRecording 
                ? 'bg-red-500 text-white shadow-red-500/20' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:shadow-xl'
              }`}
            >
              <div className={isRecording ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}>
                {isRecording ? <StopCircle size={22} /> : <Mic size={22} className="text-brand-green" />}
              </div>
              <span className={language !== 'en' ? 'urdu-text' : ''}>{isRecording ? 'Stop' : t.voiceButton}</span>
            </button>

            <button
              onClick={() => handleAnalyze()}
              disabled={isProcessing || !localInput.trim()}
              className="relative overflow-hidden flex items-center gap-2 px-8 py-3 rounded-2xl bg-brand-gradient text-white font-bold shadow-xl shadow-brand-green/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {isProcessing ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  <span className={language !== 'en' ? 'urdu-text' : ''}>{t.reportButton}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}
        {isProcessing && !error && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center mt-4 text-slate-500 font-medium ${language !== 'en' ? 'urdu-text' : ''}`}
          >
            {t.waitMsg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
