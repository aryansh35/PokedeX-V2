"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/server/actions";
import {
   User, ShieldCheck, RefreshCw, Fingerprint,
   Bookmark, Mail, Phone, LayoutGrid, Sun, Moon, Palette, Sparkles
} from "lucide-react";

import { useDashboard } from "@/context/DashboardContext";

export default function ProfilePage() {
   const { data, loading, theme, setTheme } = useDashboard();
   const [skinMode, setSkinMode] = useState<"shadow" | "zenith">("shadow");

   if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 animate-bounce">
               <svg viewBox="0 0 100 100" className="w-8 h-8 text-foreground" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="44" fill="white" />
                  <path d="M50 6A44 44 0 0 1 94 50H62A12 12 0 0 0 38 50H6A44 44 0 0 1 50 6Z" fill="currentColor" />
                  <circle cx="50" cy="50" r="12" fill="white" stroke="#000" strokeWidth="6" />
                  <path d="M2 50H38" stroke="#000" strokeWidth="6" strokeLinecap="round" />
                  <path d="M62 50H98" stroke="#000" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="47" stroke="#000" strokeWidth="6" />
               </svg>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 animate-pulse">Syncing Data...</p>
         </div>
      </div>
   );

   const profile = data?.profile || {};

   const skins = [
      { id: 'master', name: 'Master Ball', color: 'bg-[#9d5ae5]', desc: 'Premium Master Ball Mode' },
      { id: 'classic', name: 'Classic Dex', color: 'bg-[#ff3e3e]', desc: 'Standard Pokedex Red' },
      { id: 'onyx', name: 'Onyx Strike', color: 'bg-[#00ffa3]', desc: 'Tactical Stealth Mode' },
      { id: 'gold', name: 'Aura Gold', color: 'bg-[#fbbf24]', desc: 'Legendary Phoenix Heart' },
      { id: 'silver', name: 'Shadow Silver', color: 'bg-[#38bdf8]', desc: 'Silver Wing Serenity' },
      { id: 'cyber', name: 'Cyber Pink', color: 'bg-[#ff33cc]', desc: 'Neon Cyberpunk Aura' },
      { id: 'toxic', name: 'Toxic', color: 'bg-[#ff6600]', desc: 'Corrosive Energy Flow' },
      { id: 'ultraviolet', name: 'Ultraviolet', color: 'bg-[#a855f7]', desc: 'Radiant Cosmic Energy' },
      { id: 'lime', name: 'Lime Blast', color: 'bg-[#84cc16]', desc: 'Electric Bio-Energy' }
   ];

   const darkSkins = skins.map(s => ({ ...s, id: s.id }));
   const lightSkins = [
      { id: 'zenith', name: 'Zenith Prime', color: 'bg-white', desc: 'The Original Light Mode' },
      ...skins.filter(s => s.id !== 'master').map(s => ({
         id: `zenith-${s.id}`,
         name: `Zenith ${s.name.split(" ")[0]}`,
         color: s.color,
         desc: `Light ${s.name} Variant`
      }))
   ];

   return (
      <div className="p-4 lg:p-8 space-y-12 lg:space-y-16 max-w-7xl mx-auto pb-32">
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-foreground uppercase italic">Student <span className="text-primary">Profile</span></h1>
               <p className="text-muted-foreground font-medium text-sm lg:text-lg">Verified academic identity and advisor directory</p>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-2xl border border-primary/20">
               <ShieldCheck className="text-primary" size={20} />
               <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Active Identity</span>
            </div>
         </header>

         {/* Identity Burst */}
         <div className="glass-card rounded-[2.5rem] lg:rounded-[3rem] p-6 lg:p-12 border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 text-primary/5 group-hover:text-primary/10 transition-all pointer-events-none hidden lg:block">
               <Fingerprint size={280} strokeWidth={3} />
            </div>

            <div className="relative z-10">
               <div className="flex items-center gap-6 mb-8 lg:mb-10">
                  <div className="text-primary text-[12px] lg:text-[14px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                     Verified User
                  </div>
               </div>

               <h2 className="text-3xl lg:text-7xl font-black tracking-tighter mb-4 text-foreground uppercase italic leading-none">
                  {profile.name?.split(" ")[0]} <span className="text-primary/20">{profile.name?.split(" ").slice(1).join(" ")}</span>
               </h2>
               <div className="space-y-1 mb-8 lg:mb-12 opacity-60">
                  <p className="text-lg lg:text-2xl font-bold text-muted-foreground tracking-tight uppercase">SRM ID: {profile.regNo}</p>
               </div>

               <div className="flex flex-wrap items-start gap-x-12 lg:gap-x-24 gap-y-10 border-t border-primary/10 pt-8 lg:pt-12">
                  <div className="min-w-[120px]">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Program</p>
                     <p className="text-lg font-black text-foreground italic">{profile.program}</p>
                  </div>
                  <div className="min-w-[200px]">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Department</p>
                     <p className="text-lg font-black text-foreground italic line-clamp-1">{profile.department}</p>
                  </div>
                  <div className="min-w-[150px]">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Specialization</p>
                     <p className="text-lg font-black text-foreground italic">{profile.specialization}</p>
                  </div>
                  <div className="min-w-[120px]">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Assigned Section</p>
                     <p className="text-lg font-black text-foreground italic">{profile.section || "N/A"}</p>
                  </div>
                  <div className="min-w-[80px]">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Batch</p>
                     <p className="text-lg font-black text-foreground italic">{profile.batch}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Academic Meta Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="glass-card rounded-[2.5rem] p-6 lg:p-10 border-primary/10 flex items-center gap-6 group hover:bg-primary/5 transition-all">
               <div className="w-14 h-14 lg:w-16 lg:h-16 bg-primary/5 rounded-xl lg:rounded-2xl flex items-center justify-center text-primary transition-all">
                  <Mail size={28} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Official E-Mail ID</p>
                  <p className="text-base lg:text-lg font-black text-foreground italic">{profile.email || "N/A"}</p>
               </div>
            </div>

            <div className="glass-card rounded-[2.5rem] p-10 border-primary/10 flex items-center gap-6 group hover:bg-primary/5 transition-all">
               <div className="w-14 h-14 lg:w-16 lg:h-16 bg-primary/5 rounded-xl lg:rounded-2xl flex items-center justify-center text-primary transition-all">
                  <Phone size={28} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Contact Number</p>
                  <p className="text-base lg:text-lg font-black text-foreground italic">+91 {profile.phone || "N/A"}</p>
               </div>
            </div>
         </div>

         {/* Advisors Section (Fixed) */}
         <section className="space-y-8">
            <div className="flex items-center gap-4 px-4">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <User size={20} />
               </div>
               <h2 className="text-xl font-black uppercase tracking-widest text-foreground italic">Advisory <span className="text-primary">Board</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
               {profile.advisors?.map((adv: any, i: number) => (
                  <div key={i} className="glass-card rounded-[2.5rem] p-6 lg:p-10 border-primary/10 relative overflow-hidden group">
                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
                     <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">{adv.role}</p>
                     <h3 className="text-xl lg:text-3xl font-black mb-6 lg:mb-8 uppercase italic leading-none">{adv.name}</h3>

                     <div className="space-y-4">
                        <div className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors cursor-default">
                           <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                              <Mail size={18} />
                           </div>
                           <span className="font-bold text-sm">{adv.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors cursor-default">
                           <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                              <Phone size={18} />
                           </div>
                           <span className="font-bold text-sm">+91 {adv.phone || "N/A"}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Pokedex Skins Section (Categorized) */}
         <section className="space-y-8">
            <div className="flex items-center gap-4 px-4">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Palette size={20} />
               </div>
               <h2 className="text-xl font-black uppercase tracking-widest text-foreground italic">Pokedex <span className="text-primary">Skins</span></h2>
            </div>

            <div className="space-y-12">
               {/* Mode Switcher */}
               <div className="flex p-2 bg-foreground/5 rounded-[2rem] gap-2 max-w-md mx-auto border border-primary/10">
                  <button
                     onClick={() => setSkinMode("shadow")}
                     className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                        skinMode === "shadow" 
                        ? "bg-background border border-primary/20 text-primary shadow-xl shadow-primary/10" 
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                     }`}
                  >
                     <Moon size={16} />
                     Shadow
                  </button>
                  <button
                     onClick={() => setSkinMode("zenith")}
                     className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                        skinMode === "zenith" 
                        ? "bg-background border border-primary/20 text-primary shadow-xl shadow-primary/10" 
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                     }`}
                  >
                     <Sun size={16} />
                     Zenith
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {(skinMode === "shadow" ? darkSkins : lightSkins).map((skin) => (
                     <button
                        key={skin.id}
                        onClick={() => setTheme(skin.id)}
                        className={`glass-card rounded-[2.5rem] p-8 border-primary/10 text-left relative overflow-hidden group transition-all active:scale-95 ${
                           theme === skin.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-primary/5'
                        }`}
                     >
                        <div className="flex items-center justify-between mb-4">
                           <div className={`w-12 h-12 ${skin.color} rounded-2xl shadow-2xl shadow-black/40 flex items-center justify-center`}>
                              <div className={`w-4 h-4 rounded-full animate-pulse shadow-lg ${
                                 skin.id.startsWith('zenith') || skin.id === 'onyx' 
                                 ? 'bg-black/30 shadow-black/10' 
                                 : 'bg-white/60 shadow-white/20'
                              }`} />
                           </div>
                           {theme === skin.id && (
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full">Active</span>
                           )}
                        </div>
                        <h3 className="text-xl font-black text-foreground italic uppercase leading-tight line-clamp-1">{skin.name}</h3>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{skin.desc}</p>
                     </button>
                  ))}
               </div>
            </div>
         </section>
      </div>
   );
}
