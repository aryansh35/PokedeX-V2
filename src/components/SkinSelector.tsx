"use client";

import React, { useState } from "react";
import { X, Moon, Sun, Palette, Check, Sparkles } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

export default function SkinSelector() {
   const [isOpen, setIsOpen] = useState(false);
   const [activeTab, setActiveTab] = useState<"shadow" | "zenith">("shadow");
   const { theme, setTheme } = useDashboard();

   const skins = [
      { id: 'onyx', name: 'Onyx Strike', color: 'bg-[#00ffa3]', desc: 'Tactical Stealth' },
      { id: 'classic', name: 'Classic Dex', color: 'bg-[#ff3e3e]', desc: 'Pokedex Red' },
      { id: 'master', name: 'Master Ball', color: 'bg-[#9d5ae5]', desc: 'Premium Purple' },
      { id: 'gold', name: 'Aura Gold', color: 'bg-[#fbbf24]', desc: 'Legendary Gold' },
      { id: 'silver', name: 'Shadow Silver', color: 'bg-[#38bdf8]', desc: 'Silver Wing' },
      { id: 'cyber', name: 'Cyber Pink', color: 'bg-[#ff33cc]', desc: 'Neon Pink' },
      { id: 'toxic', name: 'Toxic', color: 'bg-[#ff6600]', desc: 'Corrosive' },
      { id: 'ultraviolet', name: 'Ultraviolet', color: 'bg-[#a855f7]', desc: 'Cosmic Energy' },
      { id: 'lime', name: 'Lime Blast', color: 'bg-[#84cc16]', desc: 'Bio-Energy' }
   ];

   const darkSkins = skins.map(s => ({ ...s, id: s.id }));
   const lightSkins = [
      { id: 'zenith', name: 'Zenith Prime', color: 'bg-white', desc: 'Original Light' },
      ...skins.map(s => ({
         id: `zenith-${s.id}`,
         name: `Zenith ${s.name.split(" ")[0]}`,
         color: s.color,
         desc: `Light Variant`
      }))
   ];

   return (
      <>
         {/* Global Toggle Button */}
         <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-primary/10 border border-primary/20 rounded-xl lg:rounded-2xl text-primary hover:bg-primary/20 transition-all active:scale-95 group"
         >
            <Palette size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest hidden sm:block">Pokedex Skins</span>
         </button>

         {/* Modal Overlay */}
         {isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300">
               <div 
                  className="absolute inset-0 bg-background/80 backdrop-blur-md" 
                  onClick={() => setIsOpen(false)}
               />
               
               {/* Modal Content */}
               <div className="glass-card w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] border-primary/20 shadow-[0_0_50px_rgba(var(--primary),0.1)] flex flex-col relative z-10 overflow-hidden">
                  
                  {/* Header */}
                  <div className="p-6 lg:p-8 border-b border-primary/10 flex items-center justify-between bg-primary/[0.02]">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                           <Sparkles size={20} />
                        </div>
                        <div>
                           <h2 className="text-xl font-black uppercase italic tracking-tighter text-foreground">Skin <span className="text-primary">Laboratory</span></h2>
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select your tactical interface</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                     >
                        <X size={20} />
                     </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex p-2 bg-foreground/5 gap-2">
                     <button
                        onClick={() => setActiveTab("shadow")}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                           activeTab === "shadow" 
                           ? "bg-background border border-primary/20 text-primary shadow-xl" 
                           : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        }`}
                     >
                        <Moon size={16} />
                        Shadow Skins
                     </button>
                     <button
                        onClick={() => setActiveTab("zenith")}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                           activeTab === "zenith" 
                           ? "bg-background border border-primary/20 text-primary shadow-xl" 
                           : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        }`}
                     >
                        <Sun size={16} />
                        Zenith Skins
                     </button>
                  </div>

                  {/* Grid */}
                  <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 scrollbar-hide">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(activeTab === "shadow" ? darkSkins : lightSkins).map((skin) => (
                           <button
                              key={skin.id}
                              onClick={() => {
                                 setTheme(skin.id);
                                 // We keep the modal open to see the change live
                              }}
                              className={`flex items-center gap-4 p-4 rounded-3xl border transition-all active:scale-95 text-left group ${
                                 theme === skin.id 
                                 ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
                                 : "bg-foreground/5 border-primary/10 hover:border-primary/30"
                              }`}
                           >
                              <div className={`w-12 h-12 ${skin.color} rounded-2xl flex items-center justify-center shadow-lg relative`}>
                                 <div className="w-3 h-3 bg-white/40 rounded-full animate-pulse" />
                                 {theme === skin.id && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                                       <Check size={12} strokeWidth={4} />
                                    </div>
                                 )}
                              </div>
                              <div>
                                 <h3 className={`font-black uppercase italic leading-none mb-1 ${theme === skin.id ? 'text-primary' : 'text-foreground'}`}>
                                    {skin.name}
                                 </h3>
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{skin.desc}</p>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-primary/5 border-t border-primary/10 text-center">
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">Aesthetic Calibration Complete</p>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
