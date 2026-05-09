"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/server/actions";
import {
   User, ShieldCheck, RefreshCw, Fingerprint,
   Bookmark, Mail, Phone, LayoutGrid
} from "lucide-react";

import { useDashboard } from "@/context/DashboardContext";

export default function ProfilePage() {
   const { data, loading } = useDashboard();

   if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
         <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
   );

   const profile = data?.profile || {};

   return (
      <div className="p-4 lg:p-8 space-y-12 lg:space-y-16 max-w-7xl mx-auto pb-32">
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-white uppercase italic">Student <span className="text-primary">Profile</span></h1>
               <p className="text-muted-foreground font-medium text-sm lg:text-lg">Verified academic identity and advisor directory</p>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
               <ShieldCheck className="text-emerald-500" size={20} />
               <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Active Identity</span>
            </div>
         </header>

         {/* Identity Burst (Dashboard Style) */}
         <div className="glass-card rounded-[2.5rem] lg:rounded-[3.5rem] p-6 lg:p-12 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 text-primary/5 group-hover:text-primary/10 transition-all pointer-events-none hidden lg:block">
               <Fingerprint size={280} strokeWidth={3} />
            </div>

            <div className="relative z-10">
               <div className="flex items-center gap-6 mb-8 lg:mb-10">
                  <div className="text-emerald-500 text-[12px] lg:text-[14px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     Verified User
                  </div>
               </div>

               <h2 className="text-3xl lg:text-7xl font-black tracking-tighter mb-4 text-white uppercase italic leading-none">
                  {profile.name?.split(" ")[0]} <span className="text-primary/20">{profile.name?.split(" ").slice(1).join(" ")}</span>
               </h2>
               <div className="space-y-1 mb-8 lg:mb-12 opacity-60">
                  <p className="text-lg lg:text-2xl font-bold text-muted-foreground tracking-tight uppercase">SRM ID: {profile.regNo}</p>
               </div>

               <div className="flex flex-wrap items-start gap-x-12 lg:gap-x-24 gap-y-10 border-t border-white/5 pt-8 lg:pt-12">
                  <div className="min-w-[120px]">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Program</p>
                     <p className="text-lg font-black text-white italic">{profile.program}</p>
                  </div>
                  <div className="min-w-[200px]">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Department</p>
                     <p className="text-lg font-black text-white italic line-clamp-1">{profile.department}</p>
                  </div>
                  <div className="min-w-[150px]">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Specialization</p>
                     <p className="text-lg font-black text-white italic">{profile.specialization}</p>
                  </div>
                  <div className="min-w-[120px]">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Assigned Section</p>
                     <p className="text-lg font-black text-white italic">{profile.section || "N/A"}</p>
                  </div>
                  <div className="min-w-[80px]">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Batch</p>
                     <p className="text-lg font-black text-white italic">{profile.batch}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Academic Meta Grid (Shifted Below) */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="glass-card rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 border-white/5 flex items-center gap-6 group hover:bg-white/[0.02] transition-all">
               <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white/5 rounded-xl lg:rounded-2xl flex items-center justify-center text-primary transition-all">
                  <Mail size={28} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Official E-Mail ID</p>
                  <p className="text-base lg:text-lg font-black text-white italic">{profile.email || "N/A"}</p>
               </div>
            </div>

            <div className="glass-card rounded-[2.5rem] p-10 border-white/5 flex items-center gap-6 group hover:bg-white/[0.02] transition-all">
               <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white/5 rounded-xl lg:rounded-2xl flex items-center justify-center text-primary transition-all">
                  <Phone size={28} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Contact Number</p>
                  <p className="text-base lg:text-lg font-black text-white italic">+91 {profile.phone || "N/A"}</p>
               </div>
            </div>
         </div>

         {/* Advisors Section */}
         <section className="space-y-8">
            <div className="flex items-center gap-4 px-4">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <User size={20} />
               </div>
               <h2 className="text-xl font-black uppercase tracking-widest text-white italic">Advisory <span className="text-primary">Board</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
               {profile.advisors?.map((adv: any, i: number) => (
                  <div key={i} className="glass-card rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 border-white/5 relative overflow-hidden group">
                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
                     <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">{adv.role}</p>
                     <h3 className="text-xl lg:text-3xl font-black mb-6 lg:mb-8 uppercase italic leading-none">{adv.name}</h3>

                     <div className="space-y-4">
                        <div className="flex items-center gap-4 text-muted-foreground hover:text-white transition-colors cursor-default">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                              <Mail size={18} />
                           </div>
                           <span className="font-bold text-sm">{adv.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground hover:text-white transition-colors cursor-default">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                              <Phone size={18} />
                           </div>
                           <span className="font-bold text-sm">+91 {adv.phone || "N/A"}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </section>
      </div>
   );
}
