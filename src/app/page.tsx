import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EmergencyInput from "@/components/EmergencyInput";
import ResultDisplay from "@/components/ResultDisplay";

export default function Home() {
  return (
    <main className="relative flex-1 bg-grid">
      <Navbar />
      <Hero />
      
      <div className="relative z-10">
        <EmergencyInput />
        <ResultDisplay />
      </div>

      {/* Background gradients */}
      <div className="fixed inset-0 -z-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-teal/5 rounded-full blur-[150px]" />
      </div>
      
      <footer className="mt-20 py-10 text-center text-slate-500 dark:text-slate-400 text-sm border-t border-slate-100 dark:border-slate-800">
        <p>© 2026 EmergiAI - Rapid Response Medical Assistant</p>
        <p className="mt-2">Always seek professional medical help in real emergencies.</p>
      </footer>
    </main>
  );
}
