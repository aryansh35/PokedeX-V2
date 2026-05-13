"use client";

import { useEffect, useState, useRef } from "react";
import { getDashboardData } from "@/server/actions";
import {
   RefreshCw, Calendar as CalendarIcon, Clock, LayoutGrid,
   ChevronRight, ChevronLeft, Zap, Info, Download, MapPin, User
} from "lucide-react";
import { toPng } from "html-to-image";

const TIME_SLOTS = [
   "08:00 AM - 08:50 AM", "08:50 AM - 09:40 AM", "09:45 AM - 10:35 AM", "10:40 AM - 11:30 AM",
   "11:35 AM - 12:25 PM", "12:30 PM - 01:20 PM", "01:25 PM - 02:15 PM", "02:20 PM - 03:10 PM",
   "03:15 PM - 04:05 PM", "04:05 PM - 04:55 PM"
];

const BATCH_1 = [
   ["P1", "P2/X", "P3/X", "P4", "P5", "A", "A", "F", "F", "G"],
   ["B", "B/X", "G/X", "G", "A", "P16", "P17", "P18", "P19", "P20"],
   ["P21", "P22/X", "P23/X", "P24", "P25", "C", "C", "A", "B", "G"],
   ["D", "D/X", "B/X", "E", "C", "P36", "P37", "P38", "P39", "P40"],
   ["P41", "P42/X", "P43/X", "P44", "P45", "E", "E", "C", "D", "G"]
];

const BATCH_2 = [
   ["P1", "P2/X", "NSO/NSO/P3/X", "NSO/NSO/P4", "P5", "A", "A", "F/F/P8", "F/F/P9", "G/G/P10"],
   ["B", "B/X", "C/X", "C", "A", "P16", "P17", "P18", "P19", "P20"],
   ["P21", "P22/X", "D/X", "D", "P25", "C", "C", "A/A/P29", "B/B/P30", "G"],
   ["D", "D/X", "B/X", "E", "C", "P36", "P37", "P38", "P39", "P40"],
   ["P41", "P42/X", "P43/X", "P44", "P45", "E", "E", "C/C/P49", "D/D/P50", "G"]
];

import { useDashboard } from "@/context/DashboardContext";

export default function TimetablePage() {
   const { data, loading, theme, dayOrder: todayDayOrder, lastSynced, refreshData } = useDashboard();
   const [activeBatch, setActiveBatch] = useState(1);
   const [activeDay, setActiveDay] = useState(1);
   const [currentTime, setCurrentTime] = useState<Date | null>(null);
   const tableRef = useRef<HTMLDivElement>(null);

   const getSyncStatus = () => {
      if (!lastSynced) return null;
      const diff = Math.floor((Date.now() - lastSynced) / 60000);
      if (diff < 1) return "Just now";
      if (diff < 60) return `${diff}m ago`;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return `${hours}h ${mins}m ago`;
   };

   useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
   }, []);

   useEffect(() => {
      if (todayDayOrder > 0) {
         setActiveDay(todayDayOrder);
      }
   }, [todayDayOrder]);

   const handleDownload = async () => {
      if (tableRef.current) {
         try {
            const isLight = theme?.startsWith('zenith');
            const dataUrl = await toPng(tableRef.current, {
               cacheBust: true,
               backgroundColor: isLight ? '#ffffff' : '#0a0a0b',
               pixelRatio: 3,
               width: 2200, // Increased width to prevent clipping
               style: {
                  padding: '60px',
                  borderRadius: '2rem',
                  width: '2200px'
               }
            });
            const link = document.createElement('a');
            link.download = `TimeTable.png`;
            link.href = dataUrl;
            link.click();
         } catch (err) {
            console.error("PNG Export Failed:", err);
         }
      }
   };


   useEffect(() => {
      if (data?.courses) {
         // Priority 1: Use explicit batch from profile if available
         if (data.profile?.batch && (data.profile.batch === "1" || data.profile.batch === "2")) {
            setActiveBatch(Number(data.profile.batch));
            return;
         }

         // Priority 2: Fallback to Slot Scoring logic
         let b1Score = 0;
         let b2Score = 0;
         const enrolledSlots = data.courses.map((c: any) => c.slot.split("-")).flat();
         BATCH_1.flat().forEach(slot => {
            if (enrolledSlots.some((s: string) => slot.split("/").includes(s.trim()))) b1Score++;
         });
         BATCH_2.flat().forEach(slot => {
            if (enrolledSlots.some((s: string) => slot.split("/").includes(s.trim()))) b2Score++;
         });
         setActiveBatch(b1Score >= b2Score ? 1 : 2);
      }
   }, [data]);

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

   const matrix = activeBatch === 1 ? BATCH_1 : BATCH_2;
   const currentDaySlots = matrix[activeDay - 1];
   const enrolledCourses = data?.courses || [];

   const findCourseForSlot = (slotStr: string) => {
      if (!slotStr) return null;
      const slots = slotStr.split("/");
      return enrolledCourses.find((c: any) => {
         const cSlots = c.slot.split("-");
         return slots.some((s: string) => cSlots.includes(s.trim()));
      });
   };

   const isSlotLive = (timeRange: string) => {
      try {
         const now = new Date();
         if (todayDayOrder !== activeDay) return false;

         const [startStr, endStr] = timeRange.split(" - ");

         const parseTime = (tStr: string) => {
            const cleanTime = tStr.split(" ")[0];
            let [h, m] = cleanTime.split(":").map(Number);
            if (h < 8) h += 12;
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d;
         };

         const start = parseTime(startStr);
         const end = parseTime(endStr);

         return now >= start && now <= end;
      } catch (e) {
         return false;
      }
   };

   return (
      <div className="pb-32">
         <div className="p-4 lg:p-8 space-y-12 lg:space-y-16 max-w-7xl mx-auto">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 print:hidden">
               <div className="flex-1">
                  <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none mb-3">
                     Timetable <span className="text-primary italic">Matrix</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-bold">
                     <p className="italic text-xs lg:text-sm">Batch {activeBatch}</p>
                     <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full hidden sm:block" />
                     <div className="flex items-center gap-2 text-foreground/80">
                        <Clock size={16} className="text-primary animate-pulse" />
                        <span className="tabular-nums uppercase text-[10px] lg:text-xs tracking-widest">
                           {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "--:-- --"}
                        </span>
                     </div>
                  </div>
               </div>
               <button
                  onClick={handleDownload}
                  className="flex items-center gap-3 px-6 lg:px-8 py-3 lg:py-4 bg-primary text-foreground rounded-2xl lg:rounded-3xl font-black uppercase italic shadow-2xl shadow-primary/30 hover:scale-105 transition-all group text-xs lg:text-base w-fit"
               >
                  <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
                  Download TimeTable
               </button>
            </header>

            {/* Today Badge & Day Selector Tabs (Site View) */}
            <div className="flex flex-col items-center gap-6">
               <div className="flex items-center gap-3 px-6 py-2 bg-primary/10 border border-primary/20 rounded-full animate-pulse-subtle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                     {(new Date().getDay() === 0 || new Date().getDay() === 6) 
                        ? "Holiday" 
                        : todayDayOrder > 0 
                           ? `Today: Day ${todayDayOrder}` 
                           : "Searching..."}
                  </span>
               </div>

               <div className="flex bg-foreground/5 p-1.5 rounded-[2.5rem] border border-primary/10 w-full max-w-[95vw] overflow-x-auto no-scrollbar mx-auto">
                  {[1, 2, 3, 4, 5].map((day) => (
                     <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`px-4 lg:px-8 py-3 rounded-2xl lg:rounded-3xl text-[10px] lg:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 ${activeDay === day
                           ? "bg-primary text-foreground shadow-xl shadow-primary/20"
                           : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                           }`}
                     >
                        Day {day}
                     </button>
                  ))}
               </div>
            </div>

            {/* Single Day View (Site View) */}
            <div className="space-y-6">
               <div className="grid grid-cols-1 gap-4">
                  {currentDaySlots.map((slot, i) => {
                     const course = findCourseForSlot(slot);
                     const time = TIME_SLOTS[i];
                     const isLive = isSlotLive(time);

                     return (
                        <div key={i} className={`glass-card rounded-[2.5rem] p-8 border-2 transition-all group relative flex flex-col md:flex-row md:items-center justify-between gap-8 ${isLive ? 'border-emerald-500/50 bg-primary/[0.02] shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'border-primary/10 hover:border-primary/20 hover:bg-primary/[0.02]'} ${!course ? 'opacity-20 grayscale' : ''}`}>
                           {isLive && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full flex items-center gap-2 shadow-lg shadow-emerald-500/20 animate-pulse-subtle">
                                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Live Mission</span>
                              </div>
                           )}
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                                 <Clock size={24} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Hour {i + 1}</p>
                                 <p className="text-2xl font-black text-foreground italic leading-none">{time}</p>
                              </div>
                           </div>

                           {course ? (
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                 <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{course.code} • {slot}</p>
                                    <h3 className="text-xl font-black text-foreground uppercase italic leading-tight">{course.title}</h3>
                                 </div>
                                 <div className="flex items-center md:justify-end gap-12">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                          <MapPin size={18} />
                                       </div>
                                       <div>
                                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Room</p>
                                          <p className="text-xl font-black text-foreground uppercase">{course.room}</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ) : (
                              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-primary/10 rounded-2xl lg:rounded-3xl py-6">
                                 <p className="text-xs font-black text-foreground/10 uppercase tracking-[0.3em]">{slot} — Free Slot</p>
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Hidden Full Timetable Matrix (Export Capture Only) */}
            <div className="fixed left-[-9999px] top-0">
               <div ref={tableRef} className="bg-background p-16 w-[2200px] space-y-12">
                  <header className="flex items-end justify-between">
                     <div>
                        <h1 className="text-6xl font-black tracking-tighter text-foreground uppercase italic">Academic <span className="text-primary">Matrix</span></h1>
                        <p className="text-muted-foreground font-medium text-xl italic uppercase tracking-widest">Full 2026 Rotation • Batch {activeBatch}</p>
                     </div>
                  </header>

                  <div className="glass-card rounded-[3rem] border-primary/10 overflow-hidden">
                     <table className="w-full border-collapse">
                        <thead>
                           <tr className="bg-foreground/[0.02]">
                              <th className="p-8 text-left border-r border-b border-primary/10 min-w-[150px]">
                                 <div className="flex items-center gap-3 text-muted-foreground">
                                    <Clock size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Day / Hour</span>
                                 </div>
                              </th>
                              {TIME_SLOTS.map((time, i) => (
                                 <th key={i} className="p-8 border-b border-primary/10 min-w-[160px] text-center">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{i + 1}</p>
                                    <p className="text-xs font-bold text-foreground/40">{time}</p>
                                 </th>
                              ))}
                           </tr>
                        </thead>
                        <tbody>
                           {matrix.map((dayOrder, dayIdx) => (
                              <tr key={dayIdx} className="group border-b border-primary/10">
                                 <td className="p-8 border-r border-primary/10 bg-foreground/[0.01]">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                          <CalendarIcon size={20} />
                                       </div>
                                       <p className="text-2xl font-black italic uppercase tracking-tighter">Day {dayIdx + 1}</p>
                                    </div>
                                 </td>
                                 {dayOrder.map((slot, hourIdx) => {
                                    const course = findCourseForSlot(slot);
                                    return (
                                       <td key={hourIdx} className="p-3 text-center">
                                          {course ? (
                                             <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 text-left h-full min-h-[100px] flex flex-col justify-between">
                                                <div className="absolute top-0 right-0 p-4 text-primary/10">
                                                   <Zap size={40} strokeWidth={3} />
                                                </div>
                                                <div>
                                                   <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1">{course.code}</p>
                                                   <h4 className="text-xs font-black leading-tight text-foreground uppercase italic line-clamp-2">{course.title}</h4>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between">
                                                   <span className="text-[9px] font-bold text-primary/60 uppercase">{course.room}</span>
                                                   <span className="px-2 py-0.5 bg-primary/20 rounded text-[8px] font-black text-primary">{slot}</span>
                                                </div>
                                             </div>
                                          ) : (
                                             <div className="p-4 flex items-center justify-center opacity-10 grayscale">
                                                <span className="text-[10px] font-black uppercase tracking-widest">{slot}</span>
                                             </div>
                                          )}
                                       </td>
                                    );
                                 })}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
