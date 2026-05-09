"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/zustand";
import { validateUser, validatePassword, loginAction } from "@/server/actions";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck, ChevronRight, Zap } from "lucide-react";
import Cookies from "js-cookie";

const PokeballIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8"/>
    <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="8"/>
    <circle cx="50" cy="50" r="15" fill="currentColor" stroke="black" strokeWidth="4"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [eyeOpen, setEyeOpen] = useState(false);
  const { error, setError, loading, setLoading, setEmail, email, reset } = useAuth();
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Safety: If already logged in, jump to dashboard
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) router.push("/dashboard");
  }, [router]);

  const step = email?.digest.length === 0 ? 1 : 2;

  const handleIdentifier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    
    const result = await validateUser(identifier);
    if (result.res.error) {
      setError(result.res.error);
    } else if (result.res.data) {
      setEmail({
        mail: result.res.data.identifier || identifier,
        digest: result.res.data.digest || "",
        identifier: result.res.data.identifier || identifier
      });
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await validatePassword({
      digest: email.digest,
      identifier: email.identifier,
      password: password
    });

    if (result.isAuthenticated && result.res.data.cookies) {
      Cookies.set("token", result.res.data.cookies, { expires: 30, path: '/' });
      
      const loginForm = new FormData();
      loginForm.append("email", email.mail || email.identifier);
      loginForm.append("password", password);
      
      const actionRes = await loginAction(loginForm);
      if (actionRes.success) {
        setIsAuthorized(true);
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        setError(actionRes.error || "Uplink Failed");
      }
    } else {
      setError(result.res.data?.message || "Invalid Credentials");
    }
    setLoading(false);
  };

  if (isAuthorized) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center animate-authorize">
          <ShieldCheck size={48} className="text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Access Granted</h2>
          <p className="text-primary font-bold uppercase tracking-widest text-xs">Initializing Secure Uplink...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md relative z-10 space-y-8">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-xl mb-4 group hover:scale-110 transition-transform duration-500">
            <PokeballIcon className="w-10 h-10 text-primary group-hover:rotate-12 transition-transform" />
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              Pokéde<span className="text-primary">X</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Mission Control Terminal</p>
          </div>
        </header>

        <div className="glass-card rounded-[2.5rem] p-8 lg:p-10 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Protocol: ONYX_STRIKE</p>
              <h2 className="text-xl font-bold uppercase italic tracking-tight">
                {step === 1 ? "Initialize Uplink" : "Identify Credentials"}
              </h2>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleIdentifier} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Access Identifier</label>
                <div className="relative group">
                  <input
                    name="identifier"
                    type="text"
                    required
                    placeholder="NETID / REG_NO"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold italic placeholder:text-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                  <Zap size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Next Phase <ChevronRight size={20} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black italic">
                  {email.identifier?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Identified User</p>
                  <p className="text-sm font-bold text-white italic">{email.identifier}</p>
                </div>
                <button 
                  type="button" 
                  onClick={reset}
                  className="ml-auto text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                >
                  Change
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Security Token</label>
                <div className="relative group">
                  <input
                    type={eyeOpen ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold italic placeholder:text-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setEyeOpen(!eyeOpen)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-colors"
                  >
                    {eyeOpen ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Authenticate"}
              </button>
            </form>
          )}

          {error && (
            <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">{error}</p>
            </div>
          )}
        </div>

        <footer className="text-center pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
            &copy; 2026 Academic Intelligence Division
          </p>
        </footer>
      </div>
    </div>
  );
}
