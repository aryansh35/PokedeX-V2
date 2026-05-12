"use client";

import { useAuth } from "@/hooks/zustand";
import { validatePassword, validateUser } from "@/server/actions";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const Pokeball = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background Circle */}
    <circle cx="50" cy="50" r="44" fill="white" />
    {/* Top Half (Theme Color) */}
    <path d="M50 6A44 44 0 0 1 94 50H62A12 12 0 0 0 38 50H6A44 44 0 0 1 50 6Z" fill="currentColor" />
    {/* Center Button & Lines */}
    <circle cx="50" cy="50" r="12" fill="white" stroke="#000" strokeWidth="6" />
    <path d="M2 50H38" stroke="#000" strokeWidth="6" strokeLinecap="round" />
    <path d="M62 50H98" stroke="#000" strokeWidth="6" strokeLinecap="round" />
    <circle cx="50" cy="50" r="47" stroke="#000" strokeWidth="6" />
  </svg>
);

export default function LoginPage() {
  const [eyeOpen, setEyeOpen] = useState(false);
  const { error, setError, loading, setLoading, setEmail, email, reset } = useAuth();
  const [showSessionGuard, setShowSessionGuard] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Removed aggressive reset to prevent session loss on app restart
  useEffect(() => {
    // If we already have credentials in Zustand and a token cookie, we could redirect here, 
    // but the root page already handles the /dashboard redirect which is safer.
  }, []);

  const step = email?.digest.length === 0 ? 1 : 2;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const form = new FormData(e.currentTarget);
      const hash1 = form.get("email") as string;
      const hash2 = form.get("password") as string;

      if (hash1 && hash1.length !== 0) {
        const emailVal = hash1.includes("@srmist.edu.in") ? hash1 : `${hash1}@srmist.edu.in`;
        const { res } = await validateUser(emailVal.toLowerCase());
        const dataRes = res.data;

        if (dataRes?.status_code === 400) { setError(dataRes?.message as string); setLoading(false); return; }
        if (res.error) { setError(res.error as string); setLoading(false); return; }

        if (dataRes?.digest && dataRes?.identifier) {
          setEmail({ mail: emailVal.toLowerCase(), digest: dataRes.digest as string, identifier: dataRes.identifier as string });
          setLoading(false); return;
        }
        setError("Invalid response from SRM"); setLoading(false); return;
      }

      if (hash2 && hash2.length !== 0) {
        if (!email.digest || !email.identifier) { setError("Enter your email first"); setLoading(false); return; }
        const { res } = await validatePassword({ digest: email.digest, identifier: email.identifier, password: hash2 });

        if (res.data?.isConcurrentLimit) {
          setShowSessionGuard(true);
          setLoading(false);
          return;
        }

        if (res.error) { setError(res.error as string); setLoading(false); return; }

        if (res.isAuthenticated && typeof res.data?.cookies === "string") {
          Cookies.set("token", res.data.cookies, { path: "/", expires: 30 });
          Cookies.set("user", email.mail, { path: "/", expires: 30 });
          
          // Trigger Authorization Sequence
          setIsAuthorized(true);
          setLoading(false);
          
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500); // Wait for spin animation
          return;
        }
        setError(res.data?.message || "Authentication failed"); setLoading(false); return;
      }
    } catch (error) {
      setError("Unexpected error. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Tactical Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse-slow delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150" />
      </div>

      {showSessionGuard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="w-full max-w-md bg-[#121214]/80 border border-rose-500/20 rounded-[2.5rem] p-10 shadow-2xl shadow-rose-500/10 space-y-8 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-rose-500 shadow-2xl shadow-rose-500/30 transform hover:scale-110 transition-transform">
                <AlertCircle className="w-12 h-12 text-white animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter italic uppercase text-white">
                  Maximum <span className="text-rose-500 underline decoration-rose-500/30 underline-offset-8">Session</span>
                </h2>
                <p className="text-white/50 font-medium text-xs leading-relaxed max-w-[280px] mx-auto">
                  You have reached maximum active sessions. Please terminate the active sessions manually to proceed.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <a
                href="https://academia.srmist.edu.in/49910842/portal/academia-academic-services/myProfile"
                target="_blank"
                rel="noopener"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-[0.2em] transition-all transform hover:translate-y-[-2px] active:translate-y-[1px] shadow-xl shadow-rose-500/30 text-center block text-sm"
              >
                Terminate Sessions
              </a>
              <button
                onClick={() => setShowSessionGuard(false)}
                className="w-full py-2 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all flex items-center justify-center gap-2 group"
              >
                <span className="w-8 h-[1px] bg-white/10 group-hover:w-12 transition-all" />
                Done!
                <span className="w-8 h-[1px] bg-white/10 group-hover:w-12 transition-all" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md space-y-10 z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center space-y-6">
          <div className="relative inline-block group">
            <div className={`absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 transition-opacity duration-700 ${isAuthorized ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
            <div className={`relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] transform transition-all duration-500 border border-white/20 ${isAuthorized ? 'animate-authorize' : '-rotate-6 group-hover:rotate-0'}`}>
              <Pokeball className="w-14 h-14 text-white drop-shadow-lg" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter italic uppercase text-white leading-none">
              Pokéde<span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">X</span>
            </h1>
            <div className="flex items-center justify-center gap-3">
              <span className="h-[1px] w-8 bg-white/10" />
              <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">
                {isAuthorized ? "Establishing Secure Link..." : "Mission Uplink Terminal"}
              </p>
              <span className="h-[1px] w-8 bg-white/10" />
            </div>
          </div>
        </div>

        <div className={`glass-card bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden group transition-all duration-500 ${isAuthorized ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          {/* Subtle Scanning Light */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent -translate-y-full group-hover:animate-scan" />

          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">
                  Access Identifier
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="email"
                    required
                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-5 text-white placeholder-white/10 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-bold tracking-wide"
                    placeholder="NETID / REG_NO"
                    autoFocus
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">
                  Encrypted Security Key
                </label>
                <div className="relative">
                  <input
                    type={eyeOpen ? "text" : "password"}
                    name="password"
                    required
                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-5 text-white placeholder-white/10 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-bold tracking-widest"
                    placeholder="••••••••"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setEyeOpen(p => !p)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-all p-2"
                  >
                    {eyeOpen ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-4 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-black animate-in shake-in duration-300 italic uppercase tracking-wider leading-relaxed">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{String(error)}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => { setError(""); setEmail({ mail: "", digest: "", identifier: "" }); }}
                  disabled={loading}
                  className="px-6 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all text-white/40 hover:text-white border border-white/5"
                >
                  Return
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black uppercase italic tracking-[0.2em] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 border border-white/10"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-xs">Processing...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span className="text-sm">{step === 1 ? "Initialize Uplink" : "Authorize Link"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="h-[1px] w-12 bg-white/10" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10">
            Security Protocol: ONYX_STRIKE v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
