"use client";

import { useState, useEffect } from "react";
import {
   Calendar as CalendarIcon, ChevronLeft, ChevronRight,
   Info, Zap, Star, ShieldAlert, CheckCircle2, RefreshCw
} from "lucide-react";
import { PLANNER_DATA } from "@/lib/planner-data";

import { useDashboard } from "@/context/DashboardContext";

export default function CalendarPage() {
   const { dayOrder, loading } = useDashboard();
   const [activeMonthIdx, setActiveMonthIdx] = useState(() => {
      const now = new Date();
      const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const idx = PLANNER_DATA.findIndex(p => p.month === monthLabel);
      return idx !== -1 ? idx : 4; 
   });

   const today = new Date();
   const dateStr = today.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
   const dayName = today.toLocaleString('en-US', { weekday: 'short' });
   const currentMonth = PLANNER_DATA[activeMonthIdx];

   const isToday = (d: number, m: string) => {
      return d === today.getDate() && m === today.toLocaleString('en-US', { month: 'long', year: 'numeric' });
   };

   if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
         <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 animate-bounce">
               <svg viewBox="0 0 100 100" className="w-8 h-8 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
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

   return (
      <div className="p-4 lg:p-8 space-y-12 lg:space-y-16 max-w-7xl mx-auto pb-32">
         <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
               <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-white uppercase italic">Academic <span className="text-primary">Planner</span></h1>
               <p className="text-muted-foreground font-medium text-sm lg:text-lg">Even Semester 2025-26 Matrix</p>
            </div>

            <div className="flex bg-white/5 p-1 lg:p-1.5 rounded-full border border-white/10 items-center gap-2 lg:gap-4 w-full max-w-xs mx-auto lg:mx-0 lg:w-fit justify-between">
               <button
                  onClick={() => setActiveMonthIdx(prev => Math.max(0, prev - 1))}
                  disabled={activeMonthIdx === 0}
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white hover:bg-white/5 disabled:opacity-20 transition-all flex-shrink-0"
               >
                  <ChevronLeft size={20} />
               </button>
               <span className="text-xs lg:text-sm font-black uppercase tracking-widest text-white flex-1 text-center whitespace-nowrap">
                  {currentMonth.month}
               </span>
               <button
                  onClick={() => setActiveMonthIdx(prev => Math.min(PLANNER_DATA.length - 1, prev + 1))}
                  disabled={activeMonthIdx === PLANNER_DATA.length - 1}
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white hover:bg-white/5 disabled:opacity-20 transition-all flex-shrink-0"
               >
                  <ChevronRight size={20} />
               </button>
            </div>
         </header>

         {/* Stats Overview */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="glass-card rounded-[2.5rem] p-6 lg:p-8 border-white/5 flex items-center gap-6 bg-primary/5">
               <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <CalendarIcon size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Current Date</p>
                  <p className="text-xl font-bold text-white uppercase italic">{dateStr} ({dayName})</p>
               </div>
            </div>
            
            <div className="glass-card rounded-[2.5rem] p-6 lg:p-8 border-white/5 flex items-center gap-6 relative overflow-hidden group">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${dayOrder > 0 ? 'bg-blue-500/10 text-blue-500 animate-pulse' : 'bg-white/5 text-muted-foreground'}`}>
                  <Zap size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Today's Status</p>
                  <p className={`text-xl font-bold uppercase italic ${dayOrder > 0 ? 'text-blue-500' : 'text-white'}`}>
                     {dayOrder > 0 ? `Day Order: ${dayOrder}` : (new Date().getDay() === 0 || new Date().getDay() === 6) ? "Weekend" : "Holiday"}
                  </p>
               </div>
            </div>

            <div className="glass-card rounded-[2.5rem] p-6 lg:p-8 border-white/5 flex items-center gap-6">
               <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                  <Star size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Next Holiday</p>
                  <p className="text-xl font-bold text-white uppercase italic">
                     {(() => {
                        const todayDate = new Date();
                        todayDate.setHours(0, 0, 0, 0);
                        
                        for (const monthData of PLANNER_DATA) {
                           const [mName, mYear] = monthData.month.split(" ");
                           for (const day of monthData.days) {
                              const target = new Date(`${mName} ${day.dt}, ${mYear}`);
                              if (target >= todayDate && day.do === "-") {
                                 if ((target.getDay() === 0 || target.getDay() === 6) && !day.event) continue;
                                 return `${day.event || "Holiday"} (${target.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })})`;
                              }
                           }
                        }
                        return "No Data";
                     })()}
                  </p>
               </div>
            </div>
         </div>

         {/* Calendar Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentMonth.days.map((day, i) => {
               const isNonWorking = day.do === "-";
               const isCritical = day.event.toLowerCase().includes("commencement") || day.event.toLowerCase().includes("enrolment");
               const activeToday = isToday(day.dt, currentMonth.month);

               return (
                  <div key={i} className={`glass-card rounded-[2.5rem] p-6 border-white/5 relative overflow-hidden group transition-all hover:scale-[1.02] 
                     ${activeToday ? 'ring-2 ring-primary bg-primary/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]' : ''}
                     ${isNonWorking ? 'bg-red-500/10 border-red-500/20' : isCritical ? 'bg-primary/5' : ''}`}>

                     <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 items-start">
                           <div>
                              <p className={`text-3xl font-black italic leading-none ${activeToday ? 'text-primary' : isNonWorking ? 'text-red-500' : 'text-white'}`}>{day.dt}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{day.day}</p>
                           </div>
                           {activeToday && (
                              <div className="mt-1 px-2 py-0.5 bg-primary/20 border border-primary/40 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                                 <div className="w-1 h-1 bg-primary rounded-full animate-pulse shadow-[0_0_5px_rgba(var(--primary-rgb),1)]" />
                                 <span className="text-[8px] font-black text-primary uppercase tracking-tighter">Today</span>
                              </div>
                           )}
                        </div>
                        {day.do !== "-" && (
                           <div className="px-3 py-1 bg-primary/20 rounded-xl border border-primary/30 shadow-lg shadow-primary/20">
                              <span className="text-xs font-black text-primary uppercase tracking-tight">Day {day.do}</span>
                           </div>
                        )}
                        {isNonWorking && (
                           <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                              <ShieldAlert size={16} />
                           </div>
                        )}
                     </div>

                     <div className="mt-4">
                        {day.event ? (
                           <p className={`font-black leading-tight uppercase ${isNonWorking ? 'text-xl text-red-500 italic' : isCritical ? 'text-lg text-primary' : 'text-sm text-white/80'}`}>
                              {day.event}
                           </p>
                        ) : day.do !== "-" ? (
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle2 size={10} className="text-emerald-500" />
                              Regular Class Day
                           </p>
                        ) : (
                           <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest">Non-Working Day</p>
                        )}
                     </div>

                     <div className={`absolute -bottom-2 -right-2 w-12 h-12 ${activeToday ? 'text-primary/10' : isNonWorking ? 'text-red-500/5' : 'text-white/5'} group-hover:scale-125 transition-transform`}>
                        <CalendarIcon size={48} strokeWidth={3} />
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
}
