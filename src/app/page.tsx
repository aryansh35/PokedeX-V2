"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Terminal, Shield, Zap, Target, Activity, ArrowRight } from "lucide-react";

const Pokeball = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <circle cx="50" cy="50" r="44" fill="white" />
    <path d="M50 6A44 44 0 0 1 94 50H62A12 12 0 0 0 38 50H6A44 44 0 0 1 50 6Z" fill="currentColor" />
    <circle cx="50" cy="50" r="12" fill="white" stroke="#000" strokeWidth="6" />
    <path d="M2 50H38" stroke="#000" strokeWidth="6" strokeLinecap="round" />
    <path d="M62 50H98" stroke="#000" strokeWidth="6" strokeLinecap="round" />
    <circle cx="50" cy="50" r="47" stroke="#000" strokeWidth="6" />
  </svg>
);

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = Cookies.get("token");
    if (token) setIsLoggedIn(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white relative overflow-hidden flex flex-col font-sans">
      {/* Tactical Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scan" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 lg:p-10 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/20">
            <Pokeball className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter italic">Pokéde<span className="text-primary">X</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">System Online</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto">
        <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl mb-4">
            <Zap size={14} className="text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">ONYX-STRIKE PROTOCOL ACTIVE</span>
          </div>
          
          <h2 className="text-5xl lg:text-[7rem] font-black tracking-tighter italic leading-[0.85] uppercase">
            Academic <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary animate-gradient-x">Mission Control</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-xs lg:text-xl text-white/60 font-medium leading-relaxed italic uppercase tracking-wide">
            High-fidelity intelligence for the modern student. <br className="hidden md:block" /> 
            Live tracking, GPA projections, and tactical scheduling.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
            <Link 
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="group relative px-10 py-5 bg-primary rounded-2xl font-black uppercase tracking-[0.2em] italic text-lg shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                {isLoggedIn ? "Enter Dashboard" : "Initialize Portal"}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
            
            <div className="flex items-center gap-4 text-white/40">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0b] bg-white/10 flex items-center justify-center">
                    <Activity size={12} />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">+500 Users Active</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24 lg:mt-32 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          {[
            { icon: Shield, label: "Secure Data", sub: "AES-256 Protocol" },
            { icon: Target, label: "GPA Sentinel", sub: "Live Projections" },
            { icon: Activity, label: "Live Attendance", sub: "Real-time Sync" },
            { icon: Terminal, label: "Tactical UI", sub: "ONYX Design" },
          ].map((feat, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm group hover:border-primary/30 transition-all text-left">
              <feat.icon size={20} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-black uppercase tracking-tighter mb-1">{feat.label}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-white/20">{feat.sub}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-10 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">
          Authorized Academic Intelligence // {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
