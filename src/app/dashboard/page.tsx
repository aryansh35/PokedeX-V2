"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/server/actions";
import {
   User, RefreshCw, ChevronRight, Fingerprint,
   Bookmark, LayoutGrid, Zap, Activity, Clock,
   Calendar, CheckCircle2, AlertCircle, MapPin, TrendingUp, Check
} from "lucide-react";
import Link from "next/link";

// Timetable Matrix for Day Order mapping
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

const TIME_SLOTS = [
   "08:00 AM - 08:50 AM", "08:50 AM - 09:40 AM", "09:45 AM - 10:35 AM", "10:40 AM - 11:30 AM",
   "11:35 AM - 12:25 PM", "12:30 PM - 01:20 PM", "01:25 PM - 02:15 PM", "02:20 PM - 03:10 PM",
   "03:15 PM - 04:05 PM", "04:05 PM - 04:55 PM"
];

import { useDashboard } from "@/context/DashboardContext";

export default function MasterDashboard() {
   const { data, loading, dayOrder } = useDashboard();
   const [activeBatch, setActiveBatch] = useState(1);
   const [currentTime, setCurrentTime] = useState<Date | null>(null);
   const [dateStr, setDateStr] = useState("");
   const [callsign, setCallsign] = useState<string>("");
   const [greetingPrefix, setGreetingPrefix] = useState<string>("Hello");
   const [isEditingGreeting, setIsEditingGreeting] = useState(false);

   useEffect(() => {
      const savedCallsign = localStorage.getItem("academiax_callsign");
      const savedPrefix = localStorage.getItem("academiax_prefix");

      if (savedCallsign) setCallsign(savedCallsign);
      else if (data?.profile?.name) setCallsign(data.profile.name.split(' ')[0]);
      else setCallsign("User");

      if (savedPrefix) setGreetingPrefix(savedPrefix);
   }, [data]);

   const handleBlur = () => {
      setIsEditingGreeting(false);
      if (!greetingPrefix.trim()) {
         setGreetingPrefix("Hello");
         localStorage.setItem("academiax_prefix", "Hello");
      }
      if (!callsign.trim()) {
         const defaultCall = data?.profile?.name ? data.profile.name.split(' ')[0] : "User";
         setCallsign(defaultCall);
         localStorage.setItem("academiax_callsign", defaultCall);
      }
   };

   useEffect(() => {
      const d = new Date();
      setDateStr(new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: '2-digit' }).format(d));
   }, []);

   useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
   }, []);

   useEffect(() => {
      if (data?.courses) {
         // Priority 1: Use explicit batch from profile if available
         if (data.profile?.batch && (data.profile.batch === "1" || data.profile.batch === "2")) {
            setActiveBatch(Number(data.profile.batch));
            return;
         }

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
               <svg viewBox="0 0 100 100" className="w-10 h-10 text-foreground" fill="none" xmlns="http://www.w3.org/2000/svg">
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

   if (!data && !loading) return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
         <div className="glass-card rounded-[2.5rem] p-8 lg:p-12 border-rose-500/20 text-center space-y-6 max-w-md w-full">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
               <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">Link Severed</h2>
               <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest leading-relaxed">
                  Could not establish a secure connection to SRM Academia. 
               </p>
            </div>
            <button 
               onClick={() => window.location.reload()}
               className="w-full py-4 bg-primary text-foreground text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl shadow-2xl shadow-primary/20 active:scale-95 transition-all"
            >
               Retry Connection
            </button>
            <Link href="/login" className="block text-[9px] font-black uppercase text-foreground/20 tracking-widest hover:text-foreground transition-colors">
               Return to Login
            </Link>
         </div>
      </div>
   );

   const profile = data?.profile || {};
   const attendance = data?.attendance || [];
   const courses = data?.courses || [];
   const matrix = activeBatch === 1 ? BATCH_1 : BATCH_2;
   const todaySlots = (dayOrder > 0 && dayOrder <= 5) ? matrix[dayOrder - 1] : [];

   const avgAttendance = (() => {
      if (!data?.attendance || data.attendance.length === 0) return "0.0";
      const totalConducted = data.attendance.reduce((acc: number, curr: any) => acc + (parseInt(curr.conducted) || 0), 0);
      const totalAbsent = data.attendance.reduce((acc: number, curr: any) => acc + (parseInt(curr.absent) || 0), 0);
      return totalConducted > 0 ? (((totalConducted - totalAbsent) / totalConducted) * 100).toFixed(1) : "0.0";
   })();

   const avgMarks = data?.marks?.length > 0
      ? (() => {
         let totalObtained = 0;
         let totalMax = 0;
         data.marks.forEach((m: any) => {
            const creds = parseInt(m.credits || "0");
            if (creds > 0) {
               totalObtained += parseFloat(m.totalObtained) || 0;
               totalMax += parseFloat(m.totalMax) || 0;
            }
         });
         return totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "0.0";
      })()
      : "0.0";

   const isSlotLive = (timeRange: string) => {
      try {
         const now = new Date();
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

   const getTodayMissions = () => {
      if (todaySlots.length === 0) return [];
      return todaySlots.map((slot, i) => {
         if (!slot) return null;
         const matrixSlots = slot.split("/").map((s: string) => s.trim().toUpperCase());

         let activeSlot = "";
         const course = courses.find((c: any) => {
            if (!c.slot) return false;
            const userSlots = c.slot.split("-").map((s: string) => s.trim().toUpperCase());
            const match = matrixSlots.find((ms: string) => userSlots.includes(ms));
            if (match) {
               activeSlot = match;
               return true;
            }
            return false;
         });

         const time = TIME_SLOTS[i];
         const isLive = isSlotLive(time);

         return course ? { ...course, time, hour: i + 1, activeSlot, isLive } : null;
      }).filter(Boolean);
   };

   const todayMissions = getTodayMissions();

   const getCurrentMission = () => {
      if (!currentTime || todayMissions.length === 0) return null;
      return todayMissions.find((m: any) => m.isLive);
   };

   const getNextMission = () => {
      if (!currentTime || todayMissions.length === 0) return null;
      const now = currentTime.getHours() * 60 + currentTime.getMinutes();
      return todayMissions.find((m: any) => {
         const [startStr] = m.time.split(" - ");
         const [time, period] = startStr.split(" ");
         let [h, m_] = time.split(":").map(Number);
         if (period === "PM" && h !== 12) h += 12;
         const start = h * 60 + m_;
         return start > now;
      });
   };

   const activeMission = getCurrentMission();
   const nextMission = getNextMission();

   // Calculate progress for active mission
   let missionProgress = 0;
   if (activeMission && currentTime) {
      const [startStr, endStr] = activeMission.time.split(" - ");
      const parseToMinutes = (tStr: string) => {
         const [time, period] = tStr.split(" ");
         let [h, m] = time.split(":").map(Number);
         if (period === "PM" && h !== 12) h += 12;
         return h * 60 + m;
      };
      const start = parseToMinutes(startStr);
      const end = parseToMinutes(endStr);
      const now = currentTime.getHours() * 60 + currentTime.getMinutes();
      missionProgress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
   }

   return (
      <div className="pb-32">
         {/* Live Mission Tracker (Suggestion 6) */}
         {activeMission && (
            <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8">
               <div className="glass-card rounded-[2.5rem] border-primary/20 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition-all pointer-events-none">
                     <Zap size={140} strokeWidth={2.5} />
                  </div>
                  
                  <div className="p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                     <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                           <div className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
                              Mission Active
                           </div>
                           <span className="text-foreground/20 text-[10px] font-bold uppercase tracking-widest">
                              Period {activeMission.hour} • {activeMission.time}
                           </span>
                        </div>
                        
                        <div className="space-y-1">
                           <h2 className="text-2xl lg:text-4xl font-black text-foreground uppercase italic tracking-tighter">
                              {activeMission.courseName}
                           </h2>
                           <p className="text-primary font-bold text-sm lg:text-lg flex items-center gap-2">
                              <MapPin size={18} /> {activeMission.room || "Room Pending"}
                           </p>
                        </div>

                        <div className="space-y-2 max-w-md">
                           <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-foreground/40">
                              <span>Mission Progress</span>
                              <span>{Math.round(missionProgress)}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                              <div 
                                 className="h-full bg-primary transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
                                 style={{ width: `${missionProgress}%` }} 
                              />
                           </div>
                        </div>
                     </div>

                     {nextMission && (
                        <div className="lg:border-l lg:border-primary/10 lg:pl-12 space-y-3">
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Next Objective</p>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-foreground/5 rounded-xl flex items-center justify-center text-primary/40">
                                 <ChevronRight size={20} />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-foreground uppercase italic">{nextMission.courseName}</p>
                                 <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
                                    Starts at {nextMission.time.split(" - ")[0]}
                                 </p>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}

         {/* Hero Header */}
         <div className="p-4 lg:p-8 space-y-8 lg:space-y-12 max-w-7xl mx-auto">
            <header className="flex flex-col gap-8">
               <div className="text-center space-y-2 group">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 mb-1">Authenticated Access</p>

                  {isEditingGreeting ? (
                     <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center justify-center gap-4 w-full">
                           <input
                              autoFocus
                              value={greetingPrefix}
                              onChange={(e) => {
                                 setGreetingPrefix(e.target.value);
                                 localStorage.setItem("academiax_prefix", e.target.value);
                              }}
                              onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                              className="bg-transparent border-none outline-none text-3xl lg:text-7xl font-black tracking-tighter text-foreground/40 uppercase italic leading-none text-right w-1/2 focus:ring-0"
                              placeholder="Prefix..."
                           />
                           <input
                              value={callsign}
                              onChange={(e) => {
                                 setCallsign(e.target.value);
                                 localStorage.setItem("academiax_callsign", e.target.value);
                              }}
                              onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                              className="bg-transparent border-none outline-none text-4xl lg:text-8xl font-black tracking-tighter text-foreground uppercase italic leading-none text-left w-1/2 focus:ring-0"
                              placeholder="Callsign..."
                           />
                        </div>
                        <button
                           onClick={handleBlur}
                           className="px-8 py-2 bg-primary text-[10px] font-black uppercase tracking-[0.4em] text-foreground rounded-full shadow-2xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all flex items-center gap-2"
                        >
                           <Check size={14} strokeWidth={4} />
                           Lock In ?!
                        </button>
                     </div>
                  ) : (
                     <h1
                        onClick={() => setIsEditingGreeting(true)}
                        className="text-4xl lg:text-8xl font-black tracking-tighter text-foreground uppercase italic leading-none cursor-pointer hover:scale-[1.01] transition-transform flex items-center justify-center gap-4"
                     >
                        <span className="text-foreground/40 text-3xl lg:text-7xl">{greetingPrefix}</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">{callsign || 'User'}!</span>
                     </h1>
                  )}
               </div>

               <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="flex-1">
                     <h2 className="text-3xl lg:text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none mb-4">
                        Pokéde<span className="text-primary">X</span> <span className="text-foreground/20 font-light not-italic text-lg lg:text-3xl ml-2">Mission Control</span>
                     </h2>
                     <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-muted-foreground font-bold">
                        <div className="flex items-center gap-2">
                           <Calendar size={18} className="text-primary" />
                           <span className="text-sm lg:text-base">{dateStr}</span>
                        </div>
                        <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full hidden sm:block" />
                        <span className="text-primary uppercase tracking-widest text-xs lg:text-sm">
                           {(currentTime && (currentTime.getDay() === 0 || currentTime.getDay() === 6))
                              ? "Holiday"
                              : dayOrder > 0
                                 ? `Day Order ${dayOrder}`
                                 : "Searching..."}
                        </span>
                        <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full hidden sm:block" />

                        <div className="flex items-center gap-2 text-foreground/80 min-w-[80px]">
                           <Clock size={16} className="text-primary animate-pulse" />
                           <span className="tabular-nums uppercase text-xs tracking-widest">
                              {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "--:-- --"}
                           </span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="px-6 py-3 bg-foreground/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                        <Activity className="text-primary" size={20} />
                        <div>
                           <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Avg Attendance</p>
                           <p className="text-xl font-black text-foreground leading-none">{avgAttendance}%</p>
                        </div>
                     </div>
                     <div className="px-6 py-3 bg-foreground/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                        <TrendingUp className="text-primary" size={20} />
                        <div>
                           <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Avg Marks</p>
                           <p className="text-xl font-black text-foreground leading-none">{avgMarks}%</p>
                        </div>
                     </div>
                  </div>
               </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
               {/* Intelligence & Missions - Full Width */}
               <div className="lg:col-span-4 space-y-12">
                  {/* Today's Missions */}
                  <section className="space-y-6 lg:space-y-8">
                     <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xl lg:text-3xl font-black uppercase italic tracking-tighter flex items-center gap-2 lg:gap-6">
                           Today's <span className="text-primary">Missions</span>
                           <span className="px-3 lg:px-5 py-1 bg-primary/20 border border-primary/30 text-primary text-[8px] lg:text-[11px] font-bold not-italic rounded-full tracking-[0.1em] lg:tracking-[0.2em] uppercase shadow-lg shadow-primary/10 whitespace-nowrap">
                              {todayMissions.length} Classes
                           </span>
                        </h3>
                        <Link href="/dashboard/timetable" className="text-[9px] lg:text-xs font-black uppercase text-primary hover:underline flex items-center gap-1 shrink-0">
                           Full Matrix <ChevronRight size={12} />
                        </Link>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {todayMissions.map((mission: any, i: number) => (
                           <div key={i} className={`glass-card rounded-[2.5rem] p-6 lg:p-8 border-2 transition-all group relative overflow-hidden ${mission.isLive ? 'border-primary/50 bg-primary/[0.02] shadow-[0_0_40px_rgba(var(--primary),0.1)]' : 'border-primary/10 hover:border-primary/20 hover:bg-primary/[0.02]'}`}>
                              {/* Background Decorative Element */}
                              <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition-all pointer-events-none translate-x-4 -translate-y-4">
                                 <Zap size={100} strokeWidth={2.5} />
                              </div>

                              {mission.isLive && (
                                 <div className="absolute -top-3 left-8 px-4 py-1.5 bg-primary rounded-full flex items-center gap-2 shadow-lg shadow-primary/20 animate-pulse-subtle z-10">
                                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Mission Live</span>
                                 </div>
                              )}

                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                 {/* Left Side: Intel */}
                                 <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                          <Clock size={22} />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Hour {mission.hour}</p>
                                          <p className="text-sm font-black text-foreground/40 italic uppercase tracking-widest">{mission.time}</p>
                                       </div>
                                    </div>

                                    <div className="space-y-1">
                                       <h4 className="text-2xl lg:text-3xl font-black text-foreground uppercase italic leading-none tracking-tighter line-clamp-2 min-h-[3rem] lg:min-h-[4rem] flex items-center">
                                          {mission.title}
                                       </h4>
                                       <div className="flex items-center gap-2 text-[10px] font-black text-primary/40 uppercase tracking-widest">
                                          <Bookmark size={12} />
                                          Code: {mission.code}
                                       </div>
                                    </div>
                                 </div>

                                 {/* Right Side: Deployment */}
                                 <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:pl-8 md:border-l md:border-primary/10">
                                    <div className="text-left md:text-right">
                                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">Deployment Room</p>
                                       <div className="flex items-center md:justify-end gap-3">
                                          <MapPin size={20} className="text-primary hidden md:block" />
                                          <p className="text-3xl lg:text-4xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                                             {mission.room || "TBA"}
                                          </p>
                                       </div>
                                    </div>
                                    
                                    <div className="px-4 py-2 bg-foreground/5 rounded-2xl border border-primary/5 text-[11px] font-black text-primary uppercase tracking-[0.2em] shadow-inner">
                                       Slot {mission.activeSlot}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                        {todayMissions.length === 0 && (
                           <div className="col-span-2 py-16 flex flex-col items-center justify-center border-2 border-dashed border-primary/10 rounded-[2.5rem]">
                              <Zap size={48} className="text-foreground/5 mb-4" />
                              <p className="text-sm font-black text-foreground/20 uppercase tracking-[0.3em]">No Missions Assigned Today</p>
                           </div>
                        )}
                     </div>
                  </section>
               </div>

               {/* Tactical Overlays - Full Width Below */}
               <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">

                  {/* Attendance Pulse (Focused on Today's Missions) */}
                  <div className="glass-card rounded-[2.5rem] p-6 lg:p-8 border-primary/10 space-y-6 lg:space-y-8">
                     <h3 className="text-lg lg:text-xl font-black uppercase italic tracking-widest flex items-center gap-3">
                        <Activity size={18} className="text-primary" />
                        Attendance Pulse
                     </h3>

                     <div className="space-y-6">
                        {(() => {
                           const missionCodes = new Set(todayMissions.map((m: any) => m.code?.trim().toUpperCase()).filter(Boolean));
                           const missionTitles = new Set(todayMissions.map((m: any) => m.title?.trim().toUpperCase()).filter(Boolean));

                           const todayAttendance = attendance.filter((att: any) => {
                              const attCode = att.courseCode?.trim().toUpperCase();
                              const attTitle = att.courseTitle?.trim().toUpperCase();

                              const codeMatch = missionCodes.has(attCode);
                              const titleMatch = [...missionTitles].some(mt =>
                                 attTitle && mt && (attTitle.includes(mt) || mt.includes(attTitle))
                              );

                              return codeMatch || titleMatch;
                           });

                           if (todayAttendance.length === 0) {
                              return (
                                 <div className="py-6 lg:py-8 text-center space-y-3">
                                    <CheckCircle2 className="mx-auto text-foreground/10" size={32} />
                                    <p className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.2em]">No Target Data for Today</p>
                                 </div>
                              );
                           }

                           return todayAttendance.map((att: any, i: number) => (
                              <div key={i} className="space-y-2">
                                 <div className="flex justify-between items-end">
                                    <p className="text-[10px] lg:text-xs font-black uppercase text-foreground truncate max-w-[70%]">{att.courseTitle}</p>
                                    <p className={`text-xs lg:text-sm font-black ${parseFloat(att.attendance) < 75 ? 'text-red-500' : 'text-primary'}`}>{att.attendance}%</p>
                                 </div>
                                 <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                                    <div
                                       className={`h-full rounded-full transition-all duration-1000 ${parseFloat(att.attendance) < 75 ? 'bg-red-500' : 'bg-primary'}`}
                                       style={{ width: `${att.attendance}%` }}
                                    />
                                 </div>
                              </div>
                           ));
                        })()}
                     </div>

                     <Link href="/dashboard/attendance" className="block w-full py-4 bg-foreground/5 hover:bg-foreground/10 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest transition-all">
                        Full Tactical Report
                     </Link>
                  </div>

                  {/* Tactical Navigation */}
                  <div className="space-y-4">
                     <Link href="/dashboard/attendance" className="glass-card rounded-[2.5rem] p-5 lg:p-6 border-primary/10 flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                              <CheckCircle2 size={18} />
                           </div>
                           <span className="text-xs lg:text-base font-black uppercase italic">Attendance Hub</span>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-all" />
                     </Link>
                     <Link href="/dashboard/timetable" className="glass-card rounded-[2.5rem] p-5 lg:p-6 border-primary/10 flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                              <Clock size={18} />
                           </div>
                           <span className="text-xs lg:text-base font-black uppercase italic">Matrix Engine</span>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-all" />
                     </Link>
                     <Link href="/dashboard/calendar" className="glass-card rounded-[2.5rem] p-5 lg:p-6 border-primary/10 flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                              <LayoutGrid size={18} />
                           </div>
                           <span className="text-xs lg:text-base font-black uppercase italic">Academic Planner</span>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-all" />
                     </Link>
                  </div>

                  {/* System Alert Area */}
                  <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-6">
                     <AlertCircle className="text-amber-500 flex-shrink-0" size={24} />
                     <div>
                        <h4 className="text-xs font-black uppercase text-amber-500 tracking-widest mb-1">Operational Note</h4>
                        <p className="text-[10px] font-bold text-amber-500/60 leading-relaxed uppercase">
                           Data is synchronized with SRM Academia portal. Ensure your session remains active for real-time updates.
                        </p>
                     </div>
                  </div>

               </div>
            </div>
         </div>
      </div>
   );
}

function ShieldCheck(props: any) {
   return (
      <svg
         {...props}
         xmlns="http://www.w3.org/2000/svg"
         width="24"
         height="24"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="2"
         strokeLinecap="round"
         strokeLinejoin="round"
      >
         <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
         <path d="m9 12 2 2 4-4" />
      </svg>
   );
}
