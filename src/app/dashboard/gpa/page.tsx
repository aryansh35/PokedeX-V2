"use client";

import { useDashboard } from "@/context/DashboardContext";
import { RefreshCw, Calculator, TrendingUp, Star, Award, BookOpen, Target, Plus, Trash2, GraduationCap } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function GPAPage() {
   const { data, loading } = useDashboard();
   const [targetGPA, setTargetGPA] = useState("9.0");
   const [mode, setMode] = useState<"auto" | "manual" | "cgpa">("auto");
   const [direction, setDirection] = useState<"left" | "right">("right");
   const [manualGrades, setManualGrades] = useState<Record<string, { grade: string; points: number }>>({});
   const [semesters, setSemesters] = useState<any[]>([{ id: 1, sgpa: "", credits: "" }]);

   if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
         <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
   );

   const marks = data?.marks || [];

   const grades = [
      { label: "O", points: 10 },
      { label: "A+", points: 9 },
      { label: "A", points: 8 },
      { label: "B+", points: 7 },
      { label: "B", points: 6 },
      { label: "C", points: 5 },
      { label: "F", points: 0 },
   ];

   const getGradePoints = (percentage: number) => {
      if (percentage >= 91) return { grade: "O", points: 10 };
      if (percentage >= 81) return { grade: "A+", points: 9 };
      if (percentage >= 71) return { grade: "A", points: 8 };
      if (percentage >= 61) return { grade: "B+", points: 7 };
      if (percentage >= 56) return { grade: "B", points: 6 };
      if (percentage >= 50) return { grade: "C", points: 5 };
      return { grade: "F", points: 0 };
   };

   // Calculate SGPA and Projections
   const calculator = (() => {
      let totalGradePoints = 0;
      let totalCredits = 0;

      const courseStats = marks.map((m: any) => {
         const credits = parseInt(m.credits) || 0;
         let grade = "";
         let points = 0;
         let percentage = 0;

         if (mode === "auto") {
            percentage = (parseFloat(m.totalObtained) / parseFloat(m.totalMax)) * 100;
            const res = getGradePoints(percentage);
            grade = res.grade;
            points = res.points;
         } else {
            const manual = manualGrades[m.courseCode] || { grade: "O", points: 10 };
            grade = manual.grade;
            points = manual.points;
         }

         if (credits > 0) {
            totalGradePoints += (points * credits);
            totalCredits += credits;
         }

         return { ...m, percentage, grade, points, credits };
      });

      const sgpaNum = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
      const sgpa = sgpaNum.toFixed(2);
      return { sgpa, sgpaNum, courseStats, totalCredits };
   })();

   // CGPA Logic
   const calculateCGPA = () => {
      let totalPoints = 0;
      let totalCredits = 0;
      semesters.forEach(s => {
         const sgpa = parseFloat(s.sgpa) || 0;
         const credits = parseFloat(s.credits) || 0;
         if (sgpa > 0 && credits > 0) {
            totalPoints += (sgpa * credits);
            totalCredits += credits;
         }
      });
      const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
      return { cgpa: cgpa.toFixed(2), cgpaNum: cgpa, totalCredits };
   };

   const cgpaResults = calculateCGPA();
   const targetDiff = parseFloat(targetGPA) - calculator.sgpaNum;

   const toggleManualGrade = (courseCode: string) => {
      setManualGrades(prev => {
         const current = prev[courseCode] || { grade: "O", points: 10 };
         const currentIndex = grades.findIndex(g => g.label === current.grade);
         const nextIndex = (currentIndex + 1) % grades.length;
         return { ...prev, [courseCode]: { grade: grades[nextIndex].label, points: grades[nextIndex].points } };
      });
   };

   const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
   const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

   const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
   };

   const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
   };

   const handleModeChange = (newMode: "auto" | "manual" | "cgpa") => {
      const modes: ("auto" | "manual" | "cgpa")[] = ["auto", "manual", "cgpa"];
      const newIndex = modes.indexOf(newMode);
      const currentIndex = modes.indexOf(mode);
      if (newIndex !== currentIndex) {
         setDirection(newIndex > currentIndex ? "right" : "left");
         setMode(newMode);
      }
   };

   const handleTouchEnd = () => {
      const dx = touchStart.x - touchEnd.x;
      const dy = touchStart.y - touchEnd.y;

      // Only trigger if horizontal swipe is dominant and significant
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 70) {
         const modes: ("auto" | "manual" | "cgpa")[] = ["auto", "manual", "cgpa"];
         const currentIndex = modes.indexOf(mode);
         if (dx > 0 && currentIndex < modes.length - 1) {
            setDirection("right");
            setMode(modes[currentIndex + 1]);
         }
         if (dx < 0 && currentIndex > 0) {
            setDirection("left");
            setMode(modes[currentIndex - 1]);
         }
      }
   };

   return (
      <div 
         className="pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-x-hidden"
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
      >
         <div className="p-4 lg:p-12 space-y-6 lg:space-y-12 max-w-7xl mx-auto">
            <div className="space-y-3">
               <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                  <div className="space-y-2">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-[2px] bg-primary rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Intelligence Hub</span>
                     </div>
                     <h1 className="text-3xl lg:text-8xl font-black tracking-tighter text-white uppercase italic leading-[0.8] mb-3">
                        GPA <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 italic">Sentinel</span>
                     </h1>
                     <p className="text-[10px] lg:text-lg font-medium italic uppercase tracking-widest opacity-60 text-muted-foreground">High-Precision Academic Performance Analytics</p>
                  </div>

                  {/* Unified Master Switcher */}
                  <div className="grid grid-cols-3 p-1.5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl w-full md:w-[450px]">
                     <button
                        onClick={() => handleModeChange("auto")}
                        className={`px-4 py-4 rounded-xl text-[10px] lg:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${mode === "auto" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white"}`}
                     >
                        Predicted
                     </button>
                     <button
                        onClick={() => handleModeChange("manual")}
                        className={`px-4 py-4 rounded-xl text-[10px] lg:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${mode === "manual" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white"}`}
                     >
                        Simulation
                     </button>
                     <button
                        onClick={() => handleModeChange("cgpa")}
                        className={`px-4 py-4 rounded-xl text-[10px] lg:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${mode === "cgpa" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white"}`}
                     >
                        CGPA
                     </button>
                  </div>
               </header>

               {/* Mobile Swipe Indicator */}
               <div className="flex lg:hidden items-center justify-center gap-3 py-1 text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] animate-pulse">
                  <span className="w-4 h-[1px] bg-white/10" />
                  <span>Swipe to Switch Mode</span>
                  <span className="w-4 h-[1px] bg-white/10" />
               </div>
            </div>

            <div key={mode} className={`animate-in fade-in duration-700 space-y-6 lg:space-y-12 ${direction === 'right' ? 'slide-in-from-right-20' : 'slide-in-from-left-20'}`}>
               {mode !== "cgpa" ? (
                  <>
                     {/* GPA Hero Card */}
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 glass-card rounded-[2.5rem] lg:rounded-[4rem] p-8 lg:p-14 border-white/5 relative overflow-visible group shadow-2xl">
                           {/* Decorative Background Elements */}
                           <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] group-hover:bg-primary/20 transition-all duration-1000" />
                           <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />

                           <div className="relative z-10">
                              <div className="flex items-center justify-between mb-12">
                                 <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                       <TrendingUp size={28} />
                                    </div>
                                    <div>
                                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">Live Projection</p>
                                       <p className="text-xs font-bold text-white/40">Real-time Calculation</p>
                                    </div>
                                 </div>
                                 <div className="hidden md:block">
                                    <div className="flex gap-1">
                                       {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-8 rounded-full ${i <= Math.floor(calculator.sgpaNum / 2) ? 'bg-primary' : 'bg-white/5'}`} />)}
                                    </div>
                                 </div>
                              </div>

                              <div className="flex flex-col items-center justify-center text-center gap-6 w-full">
                                 <div className="relative">
                                    <h2 className="text-6xl lg:text-[12rem] font-black tracking-tighter italic leading-none text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                       {calculator.sgpa}
                                    </h2>
                                    <div className="mt-6 flex flex-col items-center gap-2">
                                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Current Semester Grade</p>
                                       <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                          <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{mode === 'auto' ? 'Automated Sync' : 'Manual Simulation'}</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Intelligence Depth Card */}
                        <div className="glass-card rounded-[2.5rem] p-8 lg:p-10 border-white/5 flex flex-col justify-between group shadow-2xl">
                           <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Intelligence Depth</p>
                                 <GraduationCap className="text-primary/40 group-hover:text-primary transition-colors" size={20} />
                              </div>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-end">
                                    <h3 className="text-4xl font-black italic">{calculator.totalCredits}</h3>
                                    <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Credits Analyzed</p>
                                 </div>
                                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                       className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                                       style={{ width: `${(calculator.totalCredits / 25) * 100}%` }}
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="pt-8 border-t border-white/5 space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Performance Status</p>
                              <div className="flex flex-wrap gap-2">
                                 {['Verified', 'Secure', 'Optimal'].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white/40 border border-white/5">{tag}</span>
                                 ))}
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Course Grid */}
                      <div className="space-y-6">
                         <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/40">Academic Matrix</h3>
                            </div>
                            <p className="text-[10px] font-bold text-primary italic uppercase tracking-widest">
                               {mode === 'manual' ? 'Edit Mode Active' : 'Read-Only Mode'}
                            </p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {calculator.courseStats.map((course: any, i: number) => (
                               <div key={i} className={`glass-card rounded-[2.5rem] p-8 border border-white/5 hover:border-primary/20 transition-all duration-500 group relative overflow-hidden ${mode === 'manual' ? 'cursor-pointer hover:bg-primary/[0.02]' : ''}`}>
                                  <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                     <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                           <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{course.courseCode}</p>
                                           <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-2 uppercase italic tracking-tight">
                                              {course.courseTitle}
                                           </h4>
                                        </div>
                                        <button
                                           onClick={() => mode === "manual" && toggleManualGrade(course.courseCode)}
                                           className={`w-16 h-16 shrink-0 bg-white/[0.02] border flex items-center justify-center rounded-2xl text-2xl font-black italic transition-all group-hover:scale-110 shadow-2xl ${mode === "manual"
                                              ? "cursor-pointer border-primary ring-2 ring-primary/20 ring-offset-4 ring-offset-[#0a0a0b] text-primary bg-primary/5 animate-pulse"
                                              : "cursor-default border-white/5 text-white group-hover:text-primary"
                                              }`}
                                         >
                                            {course.grade}
                                         </button>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                         <div>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Credits</p>
                                            <p className="text-lg font-black italic text-white/80">{course.credits} <span className="text-[10px] opacity-40">credits</span></p>
                                         </div>
                                         <div className="text-right">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Points</p>
                                            <p className="text-lg font-black italic text-white/80">{course.points}</p>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </>
                 ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                       <div className="lg:col-span-3 space-y-6">
                          <div className="flex items-center justify-between px-4 mb-4">
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Input Matrix</p>
                             <button
                                onClick={() => setSemesters([...semesters, { id: Date.now(), sgpa: "", credits: "" }])}
                                className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-black uppercase text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
                             >
                                <Plus size={12} />
                                Add Semester
                             </button>
                          </div>

                          <div className="space-y-4">
                             {semesters.map((sem) => (
                                <div key={sem.id} className="glass-card rounded-3xl p-6 lg:p-8 border-white/5 flex flex-col md:flex-row items-center gap-8 animate-in slide-in-from-left-4 duration-500">
                                   <div className="flex-1 grid grid-cols-2 gap-6 w-full">
                                      <div className="space-y-2">
                                         <label className="text-[9px] font-black text-white/20 uppercase tracking-widest block ml-1">SGPA Score</label>
                                         <input
                                            type="number" step="0.01" placeholder="0.00" value={sem.sgpa}
                                            onChange={(e) => setSemesters(semesters.map(s => s.id === sem.id ? { ...s, sgpa: e.target.value } : s))}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xl font-black italic text-white placeholder:text-white/5 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                         />
                                      </div>
                                      <div className="space-y-2">
                                         <label className="text-[9px] font-black text-white/20 uppercase tracking-widest block ml-1">Credits</label>
                                         <input
                                            type="number" placeholder="00" value={sem.credits}
                                            onChange={(e) => setSemesters(semesters.map(s => s.id === sem.id ? { ...s, credits: e.target.value } : s))}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xl font-black italic text-white placeholder:text-white/5 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                         />
                                      </div>
                                   </div>
                                   <button
                                      onClick={() => semesters.length > 1 && setSemesters(semesters.filter(s => s.id !== sem.id))}
                                      className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shrink-0 border border-rose-500/20"
                                   >
                                      <Trash2 size={18} />
                                   </button>
                                </div>
                             ))}
                          </div>
                       </div>

                       <div className="lg:col-span-2 space-y-8">
                          <div className="glass-card rounded-[3rem] p-8 lg:p-12 border-primary/20 bg-primary/5 shadow-2xl shadow-primary/10 relative overflow-visible text-center group sticky top-8">
                             <div className="absolute top-0 right-0 p-10 text-primary/10 group-hover:scale-110 transition-transform pointer-events-none">
                                <TrendingUp size={120} />
                             </div>
                             <div className="relative z-10">
                                <p className="text-[12px] font-black uppercase tracking-[0.5em] text-primary mb-8">Cumulative Grade</p>
                                <div className="relative inline-block mb-10 w-full">
                                   <h2 className="text-5xl lg:text-[9rem] font-black tracking-tighter italic leading-none text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] break-words">
                                      {cgpaResults.cgpa}
                                   </h2>
                                </div>
                                <div className="grid grid-cols-1 gap-4 pt-8 border-t border-white/5">
                                   <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Lifetime Credits Accumulated</p>
                                      <p className="text-3xl font-black italic text-white">{cgpaResults.totalCredits}</p>
                                   </div>
                                </div>
                                <div className="mt-8 p-6 rounded-3xl bg-primary/10 border border-primary/20">
                                   <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest mb-2">Academic Standing</p>
                                   <p className="text-sm font-bold uppercase italic text-white">
                                      {cgpaResults.cgpaNum >= 9 ? 'Elite Distinction Tier' : cgpaResults.cgpaNum >= 8 ? 'High Honors Protocol' : 'Optimization Mode Active'}
                                   </p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
         </div>
      </div>
   );
}
